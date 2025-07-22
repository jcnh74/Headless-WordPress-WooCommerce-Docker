import React from "react";
import { fetchProducts } from "../lib/wooCommerceRestApi";
import ProductCard from "../components/ProductCard";

const HomePage = async () => {
  let featuredProducts = [];
  try {
    featuredProducts = await fetchProducts({ featured: true, per_page: 6 });
  } catch (error) {
    // Optionally handle error
  }

  return (
    <main className="container mx-auto py-8">
      {/* Marketing/Hero Section */}
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to WooFrontend!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Discover our best products, hand-picked just for you.
        </p>
        <a href="/shop" className="btn btn-primary">
          Shop All Products
        </a>
      </section>
      {/* Featured Products */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.images?.[0]?.src || ""}
                slug={product.slug}
              />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400">
              No featured products found.
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
