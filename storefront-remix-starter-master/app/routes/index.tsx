import { Link } from '@remix-run/react';
import { ProductCard } from '~/components/products/ProductCard';
import { useRootLoader } from '~/utils/use-root-loader';
import { useLoaderData } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { search } from '~/providers/products/products';
import { SortOrder } from '~/generated/graphql';

export async function loader({ request }: DataFunctionArgs) {
  const featuredProducts = await search(
    {
      input: {
        groupByProduct: true,
        take: 4,
        sort: { name: SortOrder.Asc },
      },
    },
    { request },
  ).then(result => result.search.items);
  
  return { featuredProducts };
}

export default function Index() {
  const { collections } = useRootLoader();
  const { featuredProducts } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Hero section */}
      <div className="relative bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
              New Season Collection
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover our latest styles crafted with premium materials for exceptional comfort and timeless elegance.
            </p>
            <div className="flex gap-4">
              <Link
                to="/all-products"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="mt-4 text-gray-600">Browse our collections and find your perfect style</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.slice(0, 3).map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              className="relative rounded-lg overflow-hidden group"
            >
              <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                <img
                  src={collection.featuredAsset?.preview + '?w=600&h=800'}
                  alt={collection.name}
                  className="object-cover object-center group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold text-white">{collection.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <p className="mt-4 text-gray-600">Our most popular items, handpicked for you</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.productId}
              {...product}
              isNew={false}
            />
          ))}
        </div>
      </div>

      {/* Call to action section */}
      <div className="bg-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ready to upgrade your style?</h2>
            <p className="mt-4 text-gray-600">Discover our latest collections and find your perfect fit.</p>
            <div className="mt-8">
              <Link
                to="/all-products"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
