import { createClient } from "@/lib/supabase/client";
import { Category } from "@/lib/models/types";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    
    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    return data || [];
  },

  async create(category: Omit<Category, "id" | "created_at">): Promise<Category | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating category:", error);
      return null;
    }
    return data;
  },

  async update(id: string, category: Partial<Category>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update(category)
      .eq("id", id);
    
    if (error) {
      console.error("Error updating category:", error);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }
    return true;
  }
};
