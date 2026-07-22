export type Role = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";
export type CustomerStatus = "LEAD" | "ACTIVE" | "INACTIVE";
export type CustomerType = "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
export type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export type Paged<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  address: string;
  customerType: CustomerType;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: number;
  minStockAlertQty: number;
  location: string;
};

export type Challan = {
  id: string;
  challanNumber: string;
  status: ChallanStatus;
  totalQty: number;
  totalAmount: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    businessName: string;
  };
  _count?: {
    items: number;
  };
};
