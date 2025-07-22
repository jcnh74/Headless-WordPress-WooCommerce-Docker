import React from "react";

const OrderConfirmationPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  // TODO: Fetch order details from WooCommerce API
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Order Confirmation</h1>
      {/* <OrderConfirmation order={order} /> */}
      <div className="text-center text-gray-400">
        Order details coming soon...
      </div>
    </main>
  );
};

export default OrderConfirmationPage;
