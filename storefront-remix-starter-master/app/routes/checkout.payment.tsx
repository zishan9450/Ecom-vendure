import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import {
  addPaymentToOrder,
  getEligiblePaymentMethods,
  getNextOrderStates,
  transitionOrderToState,
  createStripePaymentIntent,
} from '~/providers/checkout/checkout';
import { setOrderShippingAddress, setOrderShippingMethod } from '~/providers/orders/order';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import { ErrorCode, ErrorResult } from '~/generated/graphql';
import { getActiveOrder } from '~/providers/orders/order';
import { getSessionStorage } from '~/sessions';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/Button';
import { useState } from 'react';
import { StripePayment } from '~/components/checkout/StripePayment';
import { OrderDetailFragment } from '~/generated/graphql';

export async function loader({ params, request }: DataFunctionArgs) {
  const session = await getSessionStorage().then((sessionStorage) =>
    sessionStorage.getSession(request?.headers.get('Cookie')),
  );
  const activeOrder = await getActiveOrder({ request });

  if (!session || !activeOrder || !activeOrder.active || activeOrder.lines.length === 0) {
    return redirect('/');
  }

  const { eligiblePaymentMethods } = await getEligiblePaymentMethods({ request });
  const error = session.get('activeOrderError');
  
  // Get Stripe payment intent
  let stripePaymentIntent: string | undefined;
  let stripeError: string | undefined;
  
  try {
    const stripePaymentIntentResult = await createStripePaymentIntent({ request });
    stripePaymentIntent = stripePaymentIntentResult.createStripePaymentIntent ?? undefined;
  } catch (e: any) {
    stripeError = e.message;
    console.error('Error creating Stripe payment intent:', e);
  }
  
  return json({
    eligiblePaymentMethods,
    error,
    activeOrder,
    stripePaymentIntent,
    stripeError,
  });
}

export async function action({ params, request }: DataFunctionArgs) {
  try {
    // Check if we can transition to ArrangingPayment
    const { nextOrderStates } = await getNextOrderStates({ request });
    if (nextOrderStates.includes('ArrangingPayment')) {
      await transitionOrderToState('ArrangingPayment', { request });
    }

    // Add the standard payment
    const result = await addPaymentToOrder({
      method: 'standard-payment',
      metadata: {},
    }, { request });

    if (result.addPaymentToOrder?.__typename === 'Order') {
      return redirect('/checkout/confirmation');
    }

    throw new Error(result.addPaymentToOrder?.message || 'Payment failed');
  } catch (error: any) {
    return json({ error: error.message || 'An unknown error occurred' }, { status: 400 });
  }
}

export default function Payment() {
  const { error, activeOrder, stripePaymentIntent, stripeError } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const submit = useSubmit();

  const paymentErrorDisplay = getPaymentError(error);

  const handleShippingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('formAction', 'shipping');
    submit(formData, { method: 'post' });
  };

  const handlePaymentSuccess = () => {
    const formData = new FormData();
    formData.append('formAction', 'payment');
    submit(formData, { method: 'post' });
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Payment</h2>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Shipping</span>
          <span>→</span>
          <span className="text-blue-600">Payment</span>
          <span>→</span>
          <span className="text-gray-500">Confirmation</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            {activeOrder.lines.map((line) => (
              <div key={line.id} className="flex justify-between mb-2">
                <span>{line.productVariant.name} × {line.quantity}</span>
                <span>${line.linePriceWithTax / 100}</span>
              </div>
            ))}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${activeOrder.subTotalWithTax / 100}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>${activeOrder.shippingWithTax / 100}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${activeOrder.totalWithTax / 100}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Standard Payment</h3>
            <p className="text-gray-600 mb-6">This is a dummy payment for demonstration purposes only.</p>
            <Form method="post">
              <Button type="submit" className="w-full">
                Pay with Standard Payment
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPaymentError(error?: ErrorResult): string | undefined {
  if (!error || !error.errorCode) {
    return undefined;
  }
  switch (error.errorCode) {
    case ErrorCode.OrderPaymentStateError:
    case ErrorCode.IneligiblePaymentMethodError:
    case ErrorCode.PaymentFailedError:
    case ErrorCode.PaymentDeclinedError:
    case ErrorCode.OrderStateTransitionError:
    case ErrorCode.NoActiveOrderError:
      return error.message;
  }
}
