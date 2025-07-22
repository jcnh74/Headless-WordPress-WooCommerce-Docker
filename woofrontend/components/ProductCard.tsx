import React from "react";

type ProductCardProps = {
  id: number;
  name: string;
  price: string;
  image: string;
  slug: string;
};

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  image,
  slug,
}) => {
  // TODO: Add Add to Cart and Add to Wishlist functionality
  return (
    <div className="border rounded-lg p-4 flex flex-col items-center">
      <img src={image} alt={name} className="w-32 h-32 object-cover mb-2" />
      <h2 className="font-semibold text-lg mb-1">{name}</h2>
      <div className="text-primary font-bold mb-2">${price}</div>
      <div className="flex gap-2">
        <button className="btn btn-primary">Add to Cart</button>
        <button className="btn btn-secondary">Wishlist</button>
      </div>
    </div>
  );
};

export default ProductCard;
