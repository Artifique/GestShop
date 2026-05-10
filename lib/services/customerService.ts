import { createClient } from "@/lib/supabase/client";
import { Customer } from "@/lib/models/types";

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const supabase = createClient();
    const { data: customers, error } = await supabase
      .from("customers")
      .select("*, sales(total_amount, created_at)")
      .order("name");
    
    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
    
    return (customers || []).map(c => {
      const sales = c.sales || [];
      const total_spent = sales.reduce((acc: number, s: any) => acc + Number(s.total_amount), 0);
      
      let last_order = undefined;
      if (sales.length > 0) {
        const sorted = sales.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        last_order = sorted[0].created_at;
      }
      
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        created_at: c.created_at,
        total_spent,
        last_order
      };
    });
  },

  async create(customer: Omit<Customer, "id" | "created_at" | "total_spent">): Promise<Customer | null> {
    const supabase = createClient();
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
    const supabase = createClient();
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
    const supabase = createClient();
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
