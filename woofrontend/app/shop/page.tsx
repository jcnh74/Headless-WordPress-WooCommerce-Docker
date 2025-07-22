import React from "react";
// Assuming the correct paths are as follows:
import { fetchProducts, fetchCategories } from "../../lib/wooCommerceRestApi";
import ProductCard from "../../components/ProductCard";
import FilterBar from "../../components/FilterBar";

interface ShopPageProps {
  searchParams?: {
    category?: string;
    search?: string;
    orderby?: string;
    order?: string;
    min_price?: string;
    max_price?: string;
    page?: string;
  };
}

const PER_PAGE = 12;

// Client wrapper for FilterBar to handle navigation
const FilterBarClient = ({
  categories,
  filters,
}: {
  categories: any[];
  filters: Record<string, string>;
}) => {
  "use client";
  const { push } = require("next/navigation");

  const handleChange = (newFilters: Record<string, string>) => {
    // Remove empty values and reset page to 1
    const params = { ...newFilters, page: "1" };
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });
    const qs = new URLSearchParams(params).toString();
    push(`?${qs}`);
  };

  return (
    <FilterBar
      categories={categories}
      filters={filters}
      onChange={handleChange}
    />
  );
};

const ShopPage = async ({ searchParams = {} }: ShopPageProps) => {
  const {
    category,
    search,
    orderby = "date",
    order = "desc",
    min_price,
    max_price,
    page = "1",
  } = searchParams;

  let products = [];
  let categories = [];
  let totalPages = 1;
  let currentPage = parseInt(page, 10) || 1;
  try {
    categories = await fetchCategories({ per_page: 100 });
    const params: Record<string, any> = {
      per_page: PER_PAGE,
      page: currentPage,
      orderby,
      order,
    };
    if (category) params.category = category;
    if (search) params.search = search;
    if (min_price) params.min_price = min_price;
    if (max_price) params.max_price = max_price;
    const data = await fetchProducts(params);
    products = data;
    totalPages = products.length === PER_PAGE ? currentPage + 1 : currentPage;
  } catch (error) {
    return (
      <div className="text-red-500 text-center py-8">
        Failed to load products.
      </div>
    );
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = products.length === PER_PAGE ? currentPage + 1 : null;

  // Prepare filters for FilterBar (ensure all values are strings)
  const filters = {
    category: category || "",
    search: search || "",
    orderby: orderby || "date",
    order: order || "desc",
    min_price: min_price || "",
    max_price: max_price || "",
  };

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Shop</h1>
      <FilterBarClient categories={categories} filters={filters} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product: any) => (
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
            No products found.
          </div>
        )}
      </div>
      <div className="flex justify-center gap-4 mt-8">
        {prevPage && (
          <a
            href={`?${new URLSearchParams({
              ...searchParams,
              page: prevPage.toString(),
            }).toString()}`}
            className="btn btn-secondary"
          >
            Previous
          </a>
        )}
        {nextPage && (
          <a
            href={`?${new URLSearchParams({
              ...searchParams,
              page: nextPage.toString(),
            }).toString()}`}
            className="btn btn-secondary"
          >
            Next
          </a>
        )}
      </div>
    </main>
  );
};

export default ShopPage;
