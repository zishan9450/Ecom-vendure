import { Link } from '@remix-run/react';
import { Button } from '~/components/Button';
import { Price } from '~/components/products/Price';
import { useActiveOrder } from '~/utils/use-active-order';
import { OrderDetailFragment, OrderLine } from '~/generated/graphql';

export default function Cart() {
  const { activeOrder, adjustOrderLine, removeItem } = useActiveOrder();
  const items = (activeOrder?.lines || []) as OrderLine[];
  const subtotal = activeOrder?.subTotal;
  const total = activeOrder?.totalWithTax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">Your cart is empty</p>
          <Link
            to="/all-products"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            {items.map((line) => (
              <div
                key={line.id}
                className="flex py-6 border-b border-gray-200 last:border-0"
              >
                <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                  <img
                    src={line.featuredAsset?.preview + '?w=300'}
                    alt={line.productVariant.name}
                    className="w-full h-full object-center object-cover"
                  />
                </div>

                <div className="ml-6 flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        <Link to={`/products/${line.productVariant.product.slug}`}>
                          {line.productVariant.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Size: {line.productVariant.options[0]?.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Color: {line.productVariant.options[1]?.name}
                      </p>
                    </div>
                    <Price
                      priceWithTax={line.linePriceWithTax}
                      currencyCode={activeOrder?.currencyCode}
                    />
                  </div>

                  <div className="flex-1 flex items-end justify-between">
                    <div className="flex items-center border rounded-md">
                      <button
                        type="button"
                        className="p-2 text-gray-600 hover:text-gray-900"
                        onClick={() =>
                          adjustOrderLine(line.id, line.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span className="px-4 text-gray-900">{line.quantity}</span>
                      <button
                        type="button"
                        className="p-2 text-gray-600 hover:text-gray-900"
                        onClick={() =>
                          adjustOrderLine(line.id, line.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => removeItem(line.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 lg:mt-0 lg:col-span-5">
            <div className="bg-gray-50 rounded-lg px-6 py-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Order Summary
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
                    <dd className="font-medium text-gray-900">
                      Calculated at checkout
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-gray-600">Tax</dt>
                    <dd className="font-medium text-gray-900">
                      Calculated at checkout
                    </dd>
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
              </div>

              <div className="mt-8">
                <Button className="w-full">
                  Proceed to Checkout
                </Button>
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/all-products"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 