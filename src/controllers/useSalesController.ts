import { create } from "zustand";
import { Sale } from "../models/sales";
import { SalesService } from "../services/salesService";

interface SalesStore {
  sales: Sale[];
  fetchSales: (shopId: string) => Promise<void>;
}

export const useSalesStore = create<SalesStore>((set) => ({
  sales: [],
  fetchSales: async (shopId) => {
    const sales = await SalesService.getAll(shopId);
    set({ sales });
  },
}));
