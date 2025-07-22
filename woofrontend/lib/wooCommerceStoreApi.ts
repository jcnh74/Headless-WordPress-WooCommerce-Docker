import axios, { AxiosInstance } from "axios";

const storeApiUrl = process.env.WOOCOMMERCE_STORE_API_URL;

if (!storeApiUrl) {
  throw new Error(
    "WooCommerce Store API URL is not set in environment variables."
  );
}

export const wooStoreApi: AxiosInstance = axios.create({
  baseURL: storeApiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Example: Fetch store products
export async function fetchStoreProducts(params: Record<string, any> = {}) {
  try {
    const { data } = await wooStoreApi.get("/products", { params });
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

// Add more API methods as needed, e.g., fetchCart, addToCart, etc.
