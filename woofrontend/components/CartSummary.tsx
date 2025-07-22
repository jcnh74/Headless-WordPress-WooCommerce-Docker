import React from "react";

type CartSummaryProps = {
  totals: any;
  applyCoupon: (code: string) => void;
};

const CartSummary: React.FC<CartSummaryProps> = ({ totals, applyCoupon }) => {
  // TODO: Implement cart summary and coupon input
  return <div>Cart summary UI coming soon...</div>;
};

export default CartSummary;
