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

    // Exclude logo_url from main upsert if column doesn't exist, handle separately
    const { logo_url, updated_at, ...rest } = settings as any;

    // First, try to upsert without logo_url (core fields only)
    const payload: any = {
      id: 1,
      shop_name: rest.shop_name,
      contact_email: rest.contact_email,
      currency: rest.currency,
      timezone: rest.timezone,
      updated_at: new Date().toISOString()
    };

    // Only include logo_url if it's explicitly provided
    if (logo_url !== undefined) {
      payload.logo_url = logo_url;
    }

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

      // If the error is about logo_url column not existing, retry without it
      if (error.message?.includes("logo_url") || error.code === "42703") {
        console.warn("Colonne logo_url non trouvée. Nouvelle tentative sans logo_url...");
        const { logo_url: _, ...payloadWithoutLogo } = payload;
        const { error: error2 } = await supabase
          .from("settings")
          .upsert(payloadWithoutLogo);
        
        if (error2) {
          console.error("Échec de la 2ème tentative:", error2.message);
          return false;
        }
        return true;
      }

      return false;
    }
    return true;
  }
};
