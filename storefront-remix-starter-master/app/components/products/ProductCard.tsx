import { SearchQuery } from '~/generated/graphql';
import { Link } from '@remix-run/react';
import { Price } from './Price';

export type ProductCardProps = SearchQuery['search']['items'][number] & {
  isNew?: boolean;
};

export function ProductCard({
  productAsset,
  productName,
  slug,
  priceWithTax,
  currencyCode,
  isNew,
}: ProductCardProps) {
  return (
    <div className="group relative">
      <Link className="block" prefetch="intent" to={`/products/${slug}`}>
        <div className="relative">
          <img
            className="w-full rounded-lg bg-gray-100 object-cover aspect-[7/8] transition-opacity group-hover:opacity-75"
            alt={productName}
            src={productAsset?.preview + '?w=300&h=400'}
          />
          {isNew && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black text-white">
                New
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between">
          <div>
            <h3 className="text-sm text-gray-700 font-medium">{productName}</h3>
          </div>
          <p className="text-sm font-medium text-gray-900">
            <Price priceWithTax={priceWithTax} currencyCode={currencyCode} />
          </p>
        </div>
      </Link>
      <div className="mt-4">
        <button
          type="button"
          className="relative w-full flex items-center justify-center rounded-md border border-transparent bg-black py-2 px-8 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
