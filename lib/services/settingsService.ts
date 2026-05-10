import { createClient } from "@/lib/supabase/client";
import { ShopSettings } from "@/lib/models/types";

export const settingsService = {
  async getSettings(): Promise<ShopSettings | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching settings:", error);
      return null;
    }

    // If no row exists yet, return defaults
    if (!data) {
      return {
        id: 1,
        shop_name: "GestShop Boutique",
        contact_email: "contact@boutique.ml",
        currency: "XOF",
        timezone: "UTC",
        logo_url: ""
      };
    }

    return data;
  },

  async updateSettings(settings: Partial<ShopSettings>): Promise<boolean> {
    const supabase = createClient();

    const payload = {
      id: 1, // Assurez-vous que la bonne ligne est mise à jour
      ...settings, // Incluez tous les paramètres fournis
      updated_at: new Date().toISOString() // Mettez à jour explicitement l'horodatage
    };

    const { error } = await supabase
      .from("settings")
      .upsert(payload);

    if (error) {
      console.error("====== ERREUR SAUVEGARDE PARAMÈTRES ======");
      console.error("Code:", error.code);
      console.error("Message:", error.message);
      console.error("Détails:", error.details);
      console.error("Hint:", error.hint);
      console.error("==========================================");
      return false;
    }
    return true;
  }
};
