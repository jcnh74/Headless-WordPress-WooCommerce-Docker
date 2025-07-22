import React from "react";

const ProductDetailPage = async ({ params }: { params: { id: string } }) => {
  // TODO: Fetch product details, reviews, and variations from WooCommerce API
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Product Details</h1>
      {/* <ProductDetails product={product} reviews={reviews} variations={variations} relatedProducts={relatedProducts} /> */}
      <div className="text-center text-gray-400">
        Product details coming soon...
      </div>
    </main>
  );
};

export default ProductDetailPage;
