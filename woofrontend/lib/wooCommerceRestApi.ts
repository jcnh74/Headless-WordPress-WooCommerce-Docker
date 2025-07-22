import axios, { AxiosInstance } from "axios";

const apiUrl = process.env.WOOCOMMERCE_API_URL;
const apiKey = process.env.WOOCOMMERCE_API_KEY;
const apiSecret = process.env.WOOCOMMERCE_API_SECRET;

if (!apiUrl || !apiKey || !apiSecret) {
  throw new Error(
    "WooCommerce API credentials are not set in environment variables."
  );
}

export const wooRestApi: AxiosInstance = axios.create({
  baseURL: apiUrl,
  auth: {
    username: apiKey,
    password: apiSecret,
  },
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Example: Fetch products
export async function fetchProducts(params: Record<string, any> = {}) {
  try {
    const { data } = await wooRestApi.get("/products", { params });
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

// Fetch product categories
export async function fetchCategories(params: Record<string, any> = {}) {
  try {
    const { data } = await wooRestApi.get("/products/categories", { params });
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

// Add more API methods as needed, e.g., fetchProductById, fetchCategories, etc.
