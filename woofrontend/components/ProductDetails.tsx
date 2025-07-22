import React from "react";

type ProductDetailsProps = {
  product: any; // TODO: Define product type
  reviews: any[];
  variations: any[];
  relatedProducts: any[];
};

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  reviews,
  variations,
  relatedProducts,
}) => {
  // TODO: Implement product image carousel, variation selector, reviews, related products
  return (
    <div>
      <div className="mb-4">Product details UI coming soon...</div>
    </div>
  );
};

export default ProductDetails;
