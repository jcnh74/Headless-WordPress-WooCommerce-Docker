import React from "react";

type WishlistItemProps = {
  product: any;
  removeFromWishlist: () => void;
};

const WishlistItem: React.FC<WishlistItemProps> = ({
  product,
  removeFromWishlist,
}) => {
  // TODO: Implement wishlist item UI
  return (
    <div className="flex items-center justify-between border-b py-2">
      <div>{product.name}</div>
      <button onClick={removeFromWishlist} className="text-red-500">
        Remove
      </button>
    </div>
  );
};

export default WishlistItem;
