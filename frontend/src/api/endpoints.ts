import { api } from "./client";
import type { Challan, Customer, CustomerStatus, CustomerType, Paged, Product, SessionUser } from "./types";

export type CustomerInput = {
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  gstNumber?: string | null;
  address: string;
  customerType: CustomerType;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
};

export type ProductInput = {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlertQty: number;
  location: string;
};

export const authApi = {
  async login(input: { email: string; password: string }) {
    const { data } = await api.post<{ token: string; user: SessionUser }>("/auth/login", input);
    return data;
  }
};

export const customersApi = {
  async list(params?: { search?: string }) {
    const { data } = await api.get<Paged<Customer>>("/customers", { params });
    return data;
  },
  async create(input: CustomerInput) {
    const { data } = await api.post<Customer>("/customers", input);
    return data;
  },
  async update(id: string, input: Partial<CustomerInput>) {
    const { data } = await api.patch<Customer>(`/customers/${id}`, input);
    return data;
  }
};

export const productsApi = {
  async list(params?: { search?: string }) {
    const { data } = await api.get<Paged<Product>>("/products", { params });
    return data;
  },
  async lowStock() {
    const { data } = await api.get<{ data: Product[] }>("/products/low-stock");
    return data.data;
  },
  async create(input: ProductInput) {
    const { data } = await api.post<Product>("/products", input);
    return data;
  },
  async update(id: string, input: Partial<ProductInput>) {
    const { data } = await api.patch<Product>(`/products/${id}`, input);
    return data;
  },
  async addStock(productId: string, input: { quantity: number; reason: string }) {
    const { data } = await api.post<Product>(`/products/${productId}/stock-movements`, {
      quantity: input.quantity,
      movementType: "IN",
      reason: input.reason
    });
    return data;
  }
};

export const challansApi = {
  async list(params?: { search?: string }) {
    const { data } = await api.get<Paged<Challan>>("/challans", { params });
    return data;
  },
  async create(input: {
    customerId: string;
    status: "DRAFT" | "CONFIRMED";
    items: Array<{ productId: string; quantity: number }>;
  }) {
    const { data } = await api.post("/challans", input);
    return data;
  }
};
