import React from "react";

type CheckoutFormProps = {
  cart: any;
  paymentGateways: any[];
  shippingMethods: any[];
  paymentTokens: any[];
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  cart,
  paymentGateways,
  shippingMethods,
  paymentTokens,
}) => {
  // TODO: Implement checkout form fields and logic
  return <form className="space-y-4">Checkout form UI coming soon...</form>;
};

export default CheckoutForm;
