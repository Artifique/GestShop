import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/models/types";

const supabase = createClient();

export const authService = {
  async getCurrentUser(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (error) return null;
    return data;
  },

  async login(email: string, password: string): Promise<{ success: boolean, error?: string }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at");
    
    if (error) return [];
    return data || [];
  },

  async updateProfile(id: string, profile: Partial<Profile>): Promise<boolean> {
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", id);
    
    return !error;
  },

  async updatePassword(password: string): Promise<{ success: boolean, error?: string }> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
};
