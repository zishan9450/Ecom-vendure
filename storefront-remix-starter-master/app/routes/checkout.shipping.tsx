import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import { Form, useLoaderData } from '@remix-run/react';
import { getActiveOrder, setOrderShippingAddress, setOrderShippingMethod } from '~/providers/orders/order';
import { Button } from '~/components/Button';
import { useState } from 'react';
import { getActiveCustomerAddresses } from '~/providers/customer/customer';
import { Address } from '~/generated/graphql';

export async function loader({ request }: DataFunctionArgs) {
  const activeOrder = await getActiveOrder({ request });
  if (!activeOrder?.active || activeOrder.lines.length === 0) {
    return redirect('/cart');
  }
  
  // Get customer's saved addresses
  const { activeCustomer } = await getActiveCustomerAddresses({ request });
  const addresses = activeCustomer?.addresses || [];
  
  return json({ activeOrder, addresses });
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();
  
  // Check if using saved address
  const savedAddressId = formData.get('savedAddress');
  const useNewAddress = formData.get('useNewAddress') === 'true';
  
  if (savedAddressId && !useNewAddress) {
    // Use saved address from customer's address book
    const { activeCustomer } = await getActiveCustomerAddresses({ request });
    const savedAddress = activeCustomer?.addresses?.find(addr => addr.id === savedAddressId);
    
    if (savedAddress) {
      await setOrderShippingAddress({
        fullName: savedAddress.fullName,
        streetLine1: savedAddress.streetLine1,
        streetLine2: savedAddress.streetLine2,
        city: savedAddress.city,
        province: savedAddress.province,
        postalCode: savedAddress.postalCode,
        countryCode: savedAddress.country.code,
      }, { request });
    }
  } else {
    // Set shipping address from form
    await setOrderShippingAddress({
      fullName: `${formData.get('firstName')} ${formData.get('lastName')}`,
      streetLine1: formData.get('address') as string,
      city: formData.get('city') as string,
      province: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      countryCode: formData.get('country') as string,
    }, { request });
  }

  // Set shipping method
  const shippingMethod = formData.get('shippingMethod') as string;
  await setOrderShippingMethod(shippingMethod, { request });

  return redirect('/checkout/payment');
}

export default function Shipping() {
  const { activeOrder, addresses } = useLoaderData<typeof loader>();
  const [selectedShipping, setSelectedShipping] = useState('standard-shipping');
  const [useNewAddress, setUseNewAddress] = useState(!addresses?.length);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses?.[0]?.id);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Shipping</h2>
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">Shipping</span>
          <span>→</span>
          <span className="text-gray-500">Payment</span>
          <span>→</span>
          <span className="text-gray-500">Confirmation</span>
        </div>
      </div>

      <Form method="post" className="space-y-8">
        <input type="hidden" name="useNewAddress" value={useNewAddress.toString()} />
        
        {addresses?.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Saved Addresses</h3>
            <div className="space-y-4">
              {addresses.map((address) => (
                <div 
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedAddressId === address.id && !useNewAddress ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedAddressId(address.id);
                    setUseNewAddress(false);
                  }}
                >
                  <input
                    type="radio"
                    id={`address-${address.id}`}
                    name="savedAddress"
                    value={address.id}
                    checked={selectedAddressId === address.id && !useNewAddress}
                    onChange={() => {
                      setSelectedAddressId(address.id);
                      setUseNewAddress(false);
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`address-${address.id}`} className="cursor-pointer">
                    <div className="font-medium">{address.fullName}</div>
                    <div className="text-gray-600">
                      {address.streetLine1}
                      {address.streetLine2 ? `, ${address.streetLine2}` : ''}
                    </div>
                    <div className="text-gray-600">
                      {address.city}, {address.province} {address.postalCode}
                    </div>
                    <div className="text-gray-600">{address.country.name}</div>
                  </label>
                </div>
              ))}
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${
                  useNewAddress ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onClick={() => setUseNewAddress(true)}
              >
                <input
                  type="radio"
                  id="new-address"
                  name="useNewAddress"
                  checked={useNewAddress}
                  onChange={() => setUseNewAddress(true)}
                  className="mr-2"
                />
                <label htmlFor="new-address" className="font-medium cursor-pointer">
                  Use a new address
                </label>
              </div>
            </div>
          </div>
        )}

        {useNewAddress && (
          <>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Shipping information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required={useNewAddress}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required={useNewAddress}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required={useNewAddress}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required={useNewAddress}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                  <select
                    id="country"
                    name="country"
                    required={useNewAddress}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a country</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        <div>
          <h3 className="text-xl font-semibold mb-4">Delivery method</h3>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedShipping === 'standard-shipping' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onClick={() => setSelectedShipping('standard-shipping')}
            >
              <input
                type="radio"
                id="standard-shipping"
                name="shippingMethod"
                value="standard-shipping"
                checked={selectedShipping === 'standard-shipping'}
                onChange={(e) => setSelectedShipping(e.target.value)}
                className="mr-2"
              />
              <label htmlFor="standard-shipping" className="font-medium">Standard Shipping</label>
              <p className="mt-1 text-sm text-gray-500">$5.00</p>
            </div>
            <div 
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedShipping === 'express-shipping' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onClick={() => setSelectedShipping('express-shipping')}
            >
              <input
                type="radio"
                id="express-shipping"
                name="shippingMethod"
                value="express-shipping"
                checked={selectedShipping === 'express-shipping'}
                onChange={(e) => setSelectedShipping(e.target.value)}
                className="mr-2"
              />
              <label htmlFor="express-shipping" className="font-medium">Express Shipping</label>
              <p className="mt-1 text-sm text-gray-500">$10.00</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="w-full md:w-auto">
            Proceed to payment
          </Button>
        </div>
      </Form>
    </div>
  );
} 