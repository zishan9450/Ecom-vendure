import { Link } from '@remix-run/react';
import { ShoppingBagIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { useRootLoader } from '~/utils/use-root-loader';
import { useScrollingUp } from '~/utils/use-scrolling-up';
import { classNames } from '~/utils/class-names';
import { useTranslation } from 'react-i18next';

export function Header({
  onCartIconClick,
  cartQuantity,
}: {
  onCartIconClick: () => void;
  cartQuantity: number;
}) {
  const data = useRootLoader();
  const isSignedIn = !!data.activeCustomer.activeCustomer?.id;
  const isScrollingUp = useScrollingUp();
  const { t } = useTranslation();

  return (
    <header
      className={classNames(
        isScrollingUp ? 'sticky top-0 z-10 animate-dropIn' : '',
        'bg-white border-b border-gray-200',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold">
              StyleHub
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/all-products"
              className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
            >
              All Products
            </Link>
            <Link
              to="/men"
              className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
            >
              Men
            </Link>
            <Link
              to="/women"
              className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
            >
              Women
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-6">
            <button
              type="button"
              className="text-gray-900 hover:text-gray-600"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            
            <Link
              to={isSignedIn ? '/account' : '/sign-in'}
              className="text-gray-900 hover:text-gray-600"
            >
              <UserIcon className="h-6 w-6" />
            </Link>

            <button
              className="text-gray-900 hover:text-gray-600 relative"
              onClick={onCartIconClick}
              aria-label="Shopping cart"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {cartQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
