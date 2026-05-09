import { createClient } from "@/lib/supabase/client";
import { Sale } from "../models/sales";

const supabase = createClient();

export const SalesService = {
  async getAll(shopId: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("shop_id", shopId);
    if (error) throw error;
    return data || [];
  }
};
