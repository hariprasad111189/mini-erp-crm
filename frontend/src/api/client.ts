import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message ??
        error.message ??
        "Request failed";
      if (error.response && error.response.status >= 400) {
        toast.error(message);
      }
    }
    return Promise.reject(error);
  }
);
