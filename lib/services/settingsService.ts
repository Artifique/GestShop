import { createClient } from "@/lib/supabase/client";
import { ShopSettings } from "@/lib/models/types";

export const settingsService = {
  async getSettings(): Promise<ShopSettings | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .single();
    
    if (error) {
      console.error("Error fetching settings:", error);
      return null;
    }
    return data;
  },

  async updateSettings(settings: Partial<ShopSettings>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from("settings")
      .upsert({ id: 1, ...settings });

    if (error) {
      console.error("Error updating settings:", error);
      return false;
    }
    return true;
  }
};
