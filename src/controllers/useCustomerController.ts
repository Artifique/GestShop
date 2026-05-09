import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface CustomerStore {
  customers: Customer[];
  fetchCustomers: () => Promise<void>;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  fetchCustomers: async () => {
    const supabase = createClient();
    const { data } = await supabase.from("customers").select("*");
    set({ customers: data || [] });
  },
}));
