import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/models/types";

const supabase = createClient();

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) return null;
    return data;
  },

  async create(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating product:", error);
      return null;
    }
    return data;
  },

  async update(id: string, product: Partial<Product>): Promise<boolean> {
    const { error } = await supabase
      .from("products")
      .update(product)
      .eq("id", id);
    
    if (error) {
      console.error("Error updating product:", error);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting product:", error);
      return false;
    }
    return true;
  }
};
