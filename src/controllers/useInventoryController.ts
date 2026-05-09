import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
}

interface InventoryStore {
  items: InventoryItem[];
  fetchInventory: () => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  fetchInventory: async () => {
    const supabase = createClient();
    const { data } = await supabase.from("inventory").select("*");
    set({ items: data || [] });
  },
}));
