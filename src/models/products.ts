export interface Product {
  id: string;
  shop_id: string;
  category_id?: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  purchase_price: number;
  selling_price: number;
  images: string[];
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
}
