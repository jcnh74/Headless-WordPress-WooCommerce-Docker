import React from "react";

type Category = { id: number; name: string; slug: string };

type FilterBarProps = {
  categories: Category[];
  filters: {
    category?: string;
    search?: string;
    orderby?: string;
    order?: string;
    min_price?: string;
    max_price?: string;
  };
  onChange: (filters: Record<string, string>) => void;
};

const sortOptions = [
  { value: "date", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
];

const orderOptions = [
  { value: "asc", label: "Asc" },
  { value: "desc", label: "Desc" },
];

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  filters,
  onChange,
}) => {
  return (
    <form
      className="flex flex-wrap gap-4 mb-6 items-end"
      onSubmit={(e) => {
        e.preventDefault();
        onChange(filters);
      }}
    >
      {/* Category dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          className="border rounded px-2 py-1"
          value={filters.category || ""}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      {/* Price range */}
      <div>
        <label className="block text-sm font-medium mb-1">Min Price</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24"
          value={filters.min_price || ""}
          onChange={(e) => onChange({ ...filters, min_price: e.target.value })}
          min={0}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Max Price</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24"
          value={filters.max_price || ""}
          onChange={(e) => onChange({ ...filters, max_price: e.target.value })}
          min={0}
        />
      </div>
      {/* Search input */}
      <div>
        <label className="block text-sm font-medium mb-1">Search</label>
        <input
          type="text"
          className="border rounded px-2 py-1"
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search products..."
        />
      </div>
      {/* Sort dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Sort By</label>
        <select
          className="border rounded px-2 py-1"
          value={filters.orderby || "date"}
          onChange={(e) => onChange({ ...filters, orderby: e.target.value })}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {/* Order dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Order</label>
        <select
          className="border rounded px-2 py-1"
          value={filters.order || "desc"}
          onChange={(e) => onChange({ ...filters, order: e.target.value })}
        >
          {orderOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {/* Submit button (for accessibility) */}
      <button type="submit" className="btn btn-primary">
        Apply
      </button>
    </form>
  );
};

export default FilterBar;
