import React from "react";

type CartItemProps = {
  item: any; // TODO: Define cart item type
  updateQuantity: (quantity: number) => void;
  removeItem: () => void;
};

const CartItem: React.FC<CartItemProps> = ({
  item,
  updateQuantity,
  removeItem,
}) => {
  return (
    <div className="flex items-center justify-between border-b py-2">
      <div>{item.name}</div>
      <div>
        <input
          type="number"
          value={item.quantity}
          min={1}
          onChange={(e) => updateQuantity(Number(e.target.value))}
          className="w-16 border rounded"
        />
      </div>
      <div>${item.price}</div>
      <button onClick={removeItem} className="text-red-500">
        Remove
      </button>
    </div>
  );
};

export default CartItem;
