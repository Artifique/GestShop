import { createClient } from "@/lib/supabase/client";
import { Product } from "../models/products";

const supabase = createClient();

export const ProductService = {
  async getAll(shopId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId);
    
    if (error) throw error;
    return data || [];
  },

  async create(product: Omit<Product, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }
};
