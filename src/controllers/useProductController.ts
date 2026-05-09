import { create } from "zustand";
import { Product } from "../models/products";

interface ProductStore {
  products: Product[];
  loading: boolean;
  fetchProducts: (shopId: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  fetchProducts: async (shopId) => {
    set({ loading: true });
    // Données mockées pour la visualisation
    const mockProducts: Product[] = [
      { id: "1", shop_id: "demo", name: "Chemise en lin", sku: "CHM-LIN-001", selling_price: 45.00, status: 'active', images: [], created_at: new Date().toISOString(), purchase_price: 20 },
      { id: "2", shop_id: "demo", name: "Pantalon chino", sku: "PTA-CHI-002", selling_price: 60.00, status: 'active', images: [], created_at: new Date().toISOString(), purchase_price: 30 },
    ];
    set({ products: mockProducts, loading: false });
  },
}));
