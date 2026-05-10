"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createUserAction(userData: { 
  full_name: string; 
  email: string; 
  role: "admin" | "manager"; 
  password?: string 
}) {
  try {
    const admin = createAdminClient();
    
    const { data, error } = await admin.auth.admin.createUser({
      email: userData.email,
      password: userData.password || "Temp123456", // Mot de passe par défaut si non fourni
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role
      }
    });

    if (error) {
      console.error("Error creating user:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserRoleAction(userId: string, role: "admin" | "manager") {
  try {
    const admin = createAdminClient();
    
    // 1. Update in auth.users metadata
    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    });

    if (authError) return { success: false, error: authError.message };

    // 2. Update in public.profiles
    const { error: profileError } = await admin
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (profileError) return { success: false, error: profileError.message };

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllUsersWithEmails() {
  try {
    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.listUsers();
    
    if (authError) return { success: false, users: [] };

    const users = authData.users.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || "Sans Nom",
      role: u.user_metadata?.role || "manager",
      last_login: u.last_sign_in_at
    }));

    return { success: true, users };
  } catch (error) {
    return { success: false, users: [] };
  }
}
