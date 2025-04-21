import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';
import { getActiveOrder } from '~/providers/orders/order';
import { OrderDetailFragment } from '~/generated/graphql';
import { Link } from '@remix-run/react';

export async function loader({ request }: DataFunctionArgs) {
  const activeOrder = await getActiveOrder({ request });
  if (!activeOrder) {
    return redirect('/');
  }
  return json({ activeOrder });
}

export default function Confirmation() {
  const { activeOrder } = useLoaderData<{ activeOrder: OrderDetailFragment }>();

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Order Summary</h2>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Shipping</span>
          <span>→</span>
          <span className="text-gray-500">Payment</span>
          <span>→</span>
          <span className="text-blue-600">Confirmation</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-100 rounded-full p-3">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-semibold text-center mb-2">Your order has been received!</h3>
        <p className="text-gray-600 text-center mb-6">Order number: {activeOrder.code}</p>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Order Details</h4>
          {activeOrder.lines.map((line) => (
            <div key={line.id} className="flex justify-between py-2">
              <div>
                <p className="font-medium">{line.productVariant.name}</p>
                <p className="text-sm text-gray-600">Quantity: {line.quantity}</p>
              </div>
              <p className="font-medium">${line.linePriceWithTax / 100}</p>
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

      <div className="text-center">
        <Link
          to="/"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
} 