import axios from "axios";

const WP_API_URL = `${process.env.API_SITE_DOMAIN}/wp-json/wp/v2`;

const api = axios.create({
  baseURL: WP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Author {
  id: number;
  name: string;
  avatar_urls: { [size: string]: string };
}

export interface Post {
  id: number;
  author: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
}

export interface Category {
  id: number;
  name: string;
}

export const getPosts = async (page = 1, perPage = 10): Promise<Post[]> => {
  const response = await api.get(
    `/posts?page=${page}&per_page=${perPage}&_embed`
  );
  return response.data;
};

export const getPost = async (slug: string): Promise<Post | null> => {
  const response = await api.get(`/posts?slug=${slug}&_embed`);
  return response.data[0] || null;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/categories");
  return response.data;
};

export const getAuthor = async (authorId: number): Promise<Author> => {
  const response = await api.get(`/users/${authorId}`);
  return response.data;
};

export default api;
