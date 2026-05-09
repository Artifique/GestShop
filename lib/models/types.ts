export type UserRole = "admin" | "manager";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  preferences?: any;
  created_at?: string;
  last_login?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock: number;
  category_id?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  total_spent: number;
  last_order?: string;
  created_at?: string;
}

export interface Sale {
  id: string;
  customer_id?: string;
  seller_id: string;
  total_amount: number;
  payment_method: string;
  created_at?: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface ShopSettings {
  id: number;
  shop_name: string;
  contact_email: string;
  currency: string;
  timezone: string;
  updated_at?: string;
}
