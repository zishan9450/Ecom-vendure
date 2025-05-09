import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { Outlet, useLocation, useOutletContext, useNavigate } from '@remix-run/react';
import { CartContents } from '~/components/cart/CartContents';
import { OutletContext } from '~/types';
import { classNames } from '~/utils/class-names';
import { CartTotals } from '~/components/cart/CartTotals';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from '@remix-run/react';
import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import { Button } from '~/components/Button';
import { Price } from '~/components/products/Price';
import { useActiveOrder } from '~/utils/use-active-order';
import { OrderLine } from '~/generated/graphql';

const steps = ['shipping', 'payment', 'confirmation'];

export async function loader({ request }: DataFunctionArgs) {
  return json({});
}

export default function Checkout() {
  const outletContext = useOutletContext<OutletContext>();
  const { activeOrder, adjustOrderLine, removeItem } = outletContext;
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  let state = 'shipping';
  if (location.pathname === '/checkout/payment') {
    state = 'payment';
  } else if (location.pathname.startsWith('/checkout/confirmation')) {
    state = 'confirmation';
  }
  let isConfirmationPage = state === 'confirmation';

  const items = (activeOrder?.lines || []) as OrderLine[];
  const subtotal = activeOrder?.subTotal || 0;
  const total = activeOrder?.totalWithTax || 0;

  const handleProceedToPayment = () => {
    navigate('/checkout/payment');
  };

  return (
    <div className="bg-gray-50">
      <div
        className={classNames(
          isConfirmationPage ? 'lg:max-w-3xl mx-auto' : 'lg:max-w-7xl',
          'max-w-2xl mx-auto pt-8 pb-24 px-4 sm:px-6 lg:px-8',
        )}
      >
        <h2 className="sr-only">{t('cart.checkout')}</h2>
        <nav
          aria-label={t('cart.progress')}
          className="hidden sm:block pb-8 mb-8 border-b"
        >
          <ol role="list" className="flex space-x-4 justify-center">
            {steps.map((step, stepIdx) => (
              <li key={step} className="flex items-center">
                {step === state ? (
                  <span aria-current="page" className="text-primary-600">
                    {t(`checkout.steps.${step}`)}
                  </span>
                ) : (
                  <span>{t(`checkout.steps.${step}`)}</span>
                )}

                {stepIdx !== steps.length - 1 ? (
                  <ChevronRightIcon
                    className="w-5 h-5 text-gray-300 ml-4"
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </nav>
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          <div className={isConfirmationPage ? 'lg:col-span-2' : ''}>
            <Outlet context={outletContext} />
          </div>

          {/* Order summary */}
          {!isConfirmationPage && (
            <div className="mt-10 lg:mt-0">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t('order.summary')}
              </h2>

              <CartContents
                orderLines={activeOrder?.lines ?? []}
                currencyCode={activeOrder?.currencyCode!}
                editable={state === 'shipping'}
                removeItem={removeItem}
                adjustOrderLine={adjustOrderLine}
              ></CartContents>
              <div className="border-t mt-6 border-gray-200 py-6 space-y-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm">{t('common.subtotal')}</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <Price
                      priceWithTax={activeOrder?.subTotalWithTax}
                      currencyCode={activeOrder?.currencyCode}
                    />
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm">{t('common.shipping')}</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <Price
                      priceWithTax={activeOrder?.shippingWithTax ?? 0}
                      currencyCode={activeOrder?.currencyCode}
                    />
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <dt className="text-base font-medium">{t('common.total')}</dt>
                  <dd className="text-base font-medium text-gray-900">
                    <Price
                      priceWithTax={activeOrder?.totalWithTax}
                      currencyCode={activeOrder?.currencyCode}
                    />
                  </dd>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Total */}
        {!isConfirmationPage && (
          <div className="mt-10 lg:mt-0">
            <div className="bg-gray-50 rounded-lg px-6 py-8 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Order Total
              </h2>
              <div className="flow-root">
                <dl className="text-sm">
                  <div className="flex justify-between py-2">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-gray-900">
                      <Price
                        priceWithTax={subtotal}
                        currencyCode={activeOrder?.currencyCode}
                      />
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-gray-600">Shipping</dt>
                    <dd className="font-medium text-gray-900">Free</dd>
                  </div>
                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <dt className="text-base font-medium text-gray-900">Total</dt>
                    <dd className="text-base font-medium text-gray-900">
                      <Price
                        priceWithTax={total}
                        currencyCode={activeOrder?.currencyCode}
                      />
                    </dd>
                  </div>
                </dl>
                <div className="mt-8">
                  <Button
                    className="w-full"
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
