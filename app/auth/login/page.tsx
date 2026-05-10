"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LayoutGrid, Lock, Mail, Store } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

import { authService } from "@/lib/services/authService";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    const result = await authService.login(values.email, values.password);
    
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      form.setError("root", { message: result.error || "Email ou mot de passe incorrect" });
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A1A] overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="relative flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-3 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/20">
                <Store className="h-6 w-6 text-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                GestShop
              </h1>
            </div>
            <h2 className="text-3xl font-extrabold text-foreground">Ravi de vous revoir</h2>
            <p className="text-zinc-400 text-lg">Entrez vos identifiants pour gérer votre boutique.</p>
          </div>

          <div className="glass-effect rounded-3xl p-8 shadow-lg border border-border">            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {form.formState.errors.root && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 animate-in shake-1">
                    <p className="text-sm text-destructive text-center font-medium">{form.formState.errors.root.message}</p>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-zinc-300 font-medium">Email professionnel</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="nom@entreprise.com" 
                            className="h-12 pl-12 bg-input border-border text-foreground rounded-xl focus:ring-primary/50 focus:border-primary transition-all"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-zinc-300 font-medium">Mot de passe</FormLabel>
                        <a href="#" className="text-xs text-primary hover:underline font-medium">Oublié ?</a>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-12 pl-12 bg-input border-border text-foreground rounded-xl focus:ring-primary/50 focus:border-primary transition-all"
                            {...field}
                          />                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </FormProvider>
          </div>

          <div className="text-center">
            <p className="text-zinc-500 text-sm">
              Pas encore de compte ? {" "}
              <a href="#" className="text-foreground hover:text-primary font-bold transition-colors">Demander un accès</a>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Side */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-[#050510] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative w-full max-w-xl animate-in zoom-in-95 duration-1000">
           <div className="glass-effect rounded-[40px] p-10 border border-border shadow-lg overflow-hidden group">              <div className="absolute top-0 right-0 p-8">
                 <LayoutGrid className="w-12 h-12 text-primary/40 group-hover:text-primary/60 transition-colors" />
              </div>
              <h3 className="text-4xl font-bold text-foreground mb-6 leading-tight">
                Gestion de stock réinventée.
              </h3>
              <p className="text-zinc-400 text-xl mb-12 max-w-md">
                Analysez vos ventes, gérez vos fournisseurs et optimisez vos profits avec GestShop.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: "Ventes réelles", value: "+24%", color: "text-emerald-400" },
                   { label: "Clients actifs", value: "1.2k", color: "text-blue-400" },
                   { label: "Stock critique", value: "3", color: "text-amber-400" },
                   { label: "Marge brute", value: "32%", color: "text-violet-400" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-secondary rounded-2xl p-4 border border-border hover:bg-secondary/50 transition-colors">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
