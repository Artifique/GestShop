import { createClient } from "@/lib/supabase/client";
import { Sale, SaleItem } from "@/lib/models/types";

export const saleService = {
  async createSale(sale: Omit<Sale, "id" | "created_at">, items: Omit<SaleItem, "id" | "sale_id">[]): Promise<boolean> {
    const supabase = createClient();
    // 1. Create the sale
    const { data: saleData, error: saleError } = await supabase
      .from("sales")
      .insert(sale)
      .select()
      .single();

    if (saleError || !saleData) {
      console.error("Error creating sale:", saleError);
      return false;
    }

    // 2. Create the sale items
    const saleItems = items.map(item => ({
      ...item,
      sale_id: saleData.id
    }));

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItems);

    if (itemsError) {
      console.error("Error creating sale items:", itemsError);
      // Note: In a real app, you'd want to roll back the sale creation here
      return false;
    }

    // 3. Update stock for each product
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();
      
      if (product) {
        await supabase
          .from("products")
          .update({ stock: product.stock - item.quantity })
          .eq("id", item.product_id);
      }
    }

    return true;
  },

  async getAll(): Promise<Sale[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sales")
      .select("*, customers(name)")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching sales:", error);
      return [];
    }
    return data || [];
  },

  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sale_items")
      .select("*, products(name)")
      .eq("sale_id", saleId);
    
    if (error) {
      console.error("Error fetching sale items:", error);
      return [];
    }
    return data || [];
  },

  async getDashboardStats() {
    const supabase = createClient();
    const { data: sales, error } = await supabase
      .from("sales")
      .select("*, sale_items(*, products(*, categories(*)))")
      .order("created_at", { ascending: false });

    if (error) return null;
    return sales;
  }
};
