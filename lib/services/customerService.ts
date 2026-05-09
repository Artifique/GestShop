import { createClient } from "@/lib/supabase/client";
import { Customer } from "@/lib/models/types";

const supabase = createClient();

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");
    
    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
    return data || [];
  },

  async create(customer: Omit<Customer, "id" | "created_at" | "total_spent">): Promise<Customer | null> {
    const { data, error } = await supabase
      .from("customers")
      .insert({ ...customer, total_spent: 0 })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating customer:", error);
      return null;
    }
    return data;
  },

  async update(id: string, customer: Partial<Customer>): Promise<boolean> {
    const { error } = await supabase
      .from("customers")
      .update(customer)
      .eq("id", id);
    
    if (error) {
      console.error("Error updating customer:", error);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting customer:", error);
      return false;
    }
    return true;
  }
};
