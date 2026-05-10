"use client";

import React, { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Globe, CreditCard, Save, RefreshCw, Loader2, Eye, EyeOff } from "lucide-react";
import { SuccessDialog } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useTheme } from "@/app/theme-provider";

import { settingsService } from "@/lib/services/settingsService";
import { authService } from "@/lib/services/authService";
import { ShopSettings, Profile } from "@/lib/models/types";

export default function SettingsPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { theme, setTheme } = useTheme();

  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    id: 1,
    shop_name: "GestShop Boutique",
    contact_email: "contact@gestshop.com",
    currency: "EUR",
    timezone: "UTC+1"
  });

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: ""
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [notifications, setNotifications] = useState({
    lowStock: true,
    dailyReports: false,
    newCustomers: true,
    systemUpdates: true
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [sData, pData] = await Promise.all([
        settingsService.getSettings(),
        authService.getCurrentUser()
      ]);
      
      if (sData) setShopSettings(sData);
      if (pData) {
        setCurrentUser(pData);
        setProfileForm({ full_name: pData.full_name || "" });
        if (pData.preferences?.notifications) {
          setNotifications(pData.preferences.notifications as typeof notifications);
        }
        if (pData.role !== 'admin') {
          setActiveTab("profile");
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    let success = false;

    if (activeTab === "general") {
      success = await settingsService.updateSettings(shopSettings);
    } else if (activeTab === "profile" && currentUser) {
      success = await authService.updateProfile(currentUser.id, {
        full_name: profileForm.full_name
      });
      if (success) {
        // Refresh local user data
        const updatedUser = await authService.getCurrentUser();
        setCurrentUser(updatedUser);
      }
    } else if (activeTab === "notifications" && currentUser) {
      const updatedPrefs = { ...currentUser.preferences, notifications };
      success = await authService.updateProfile(currentUser.id, {
        preferences: updatedPrefs
      });
      if (success) {
        const updatedUser = await authService.getCurrentUser();
        setCurrentUser(updatedUser);
      }
    } else if (activeTab === "security") {
      if (securityForm.newPassword !== securityForm.confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        setSaving(false);
        return;
      }
      const result = await authService.updatePassword(securityForm.newPassword);
      success = result.success;
      if (success) {
        setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(result.error || "Erreur lors de la mise à jour du mot de passe.");
      }
    } else {
      // Mock success for other tabs for now
      await new Promise(r => setTimeout(r, 500));
      success = true;
    }

    if (success) {
      setShowSuccess(true);
    }
    setSaving(false);
  };

  const tabs = [
    ...(currentUser?.role === 'admin' ? [{ id: "general", label: "Général", icon: Settings }] : []),
    { id: "profile", label: "Profil", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: Shield },
  ];

  const themeOptions = [
    { id: "light", label: "Clair", value: "light" },
    { id: "dark", label: "Sombre", value: "dark" },
    { id: "system", label: "Système", value: "system" },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight italic">Paramètres <span className="text-primary italic">Système</span></h1>
          <p className="text-muted-foreground mt-1">Configurez votre boutique et vos préférences personnelles.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 border border-transparent font-bold",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-card rounded-[32px] p-8 space-y-10">
          {activeTab === "general" && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-6">
                <h2 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tighter">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                  Informations de la Boutique
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Nom de la boutique</label>
                    <input 
                      value={shopSettings.shop_name}
                      onChange={e => setShopSettings({...shopSettings, shop_name: e.target.value})}
                      className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Email de contact</label>
                    <input 
                      value={shopSettings.contact_email}
                      onChange={e => setShopSettings({...shopSettings, contact_email: e.target.value})}
                      className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Devise Locale</label>
                    <select 
                      value={shopSettings.currency}
                      onChange={e => setShopSettings({...shopSettings, currency: e.target.value})}
                      className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all appearance-none font-bold"
                    >
                      <option value="XOF">FCFA (XOF)</option>
                      <option value="EUR">Euro (FCFA)</option>
                      <option value="USD">Dollar ($)</option>
                      <option value="CFA">Franc CFA (FCFA)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Région / Timezone</label>
                    <select 
                      value={shopSettings.timezone}
                      onChange={e => setShopSettings({...shopSettings, timezone: e.target.value})}
                      className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all appearance-none font-bold"
                    >
                      <option value="UTC">UTC (Londres)</option>
                      <option value="UTC">UTC (Bamako)</option>
                      <option value="UTC+1">UTC+1 (Paris)</option>
                      <option value="UTC+3">UTC+3 (Dubaï)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-border/50 space-y-6">
                <h2 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tighter">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  Thème & Design System
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {themeOptions.map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => setTheme(t.value)}
                      className={cn(
                        "relative p-1 rounded-[24px] border-2 transition-all duration-500 group overflow-hidden",
                        theme === t.value 
                          ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
                          : "border-border/50 bg-secondary/30 hover:border-primary/30"
                      )}
                    >
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-sm font-black uppercase tracking-widest",
                            theme === t.value ? "text-primary" : "text-muted-foreground"
                          )}>{t.label}</span>
                          {theme === t.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <div className="h-24 w-full rounded-2xl border border-border/50 overflow-hidden relative shadow-inner">
                          <div className={cn(
                            "absolute inset-0 flex",
                            t.value === "light" ? "bg-white" : t.value === "dark" ? "bg-[#0A0A1A]" : "bg-gradient-to-r from-white to-[#0A0A1A]"
                          )}>
                            <div className="w-1/3 h-full border-r border-border/20 bg-primary/10" />
                            <div className="flex-1 p-2 space-y-2">
                               <div className="h-1.5 w-1/2 rounded bg-muted-foreground/20" />
                               <div className="h-1.5 w-full rounded bg-muted-foreground/10" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && currentUser && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="flex items-center gap-6 pb-6 border-b border-border/50">
                  <div className="h-24 w-24 rounded-[32px] bg-gradient-to-tr from-primary to-violet-500 p-1 shadow-xl shadow-primary/20">
                     <div className="h-full w-full rounded-[28px] bg-card flex items-center justify-center font-black text-3xl text-primary border border-white/10 shadow-inner">
                        {currentUser.full_name?.split(' ').map(n => n[0]).join('') || "U"}
                     </div>
                  </div>
                  <div className="space-y-2">
                     <button className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        Changer la photo
                     </button>
                     <p className="text-xs text-muted-foreground font-medium pl-1">JPG, GIF ou PNG. Max 2Mo.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Nom d&apos;utilisateur</label>
                    <input 
                      value={profileForm.full_name}
                      onChange={e => setProfileForm({...profileForm, full_name: e.target.value})}
                      className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Email Personnel</label>
                    <input 
                      disabled
                      value={currentUser.id} // or email if we have it in profile, but we don't store email directly in profile usually. For UI, we can just leave it static or mock if we don't have it.
                      placeholder="Email géré par Supabase Auth"
                      className="w-full h-12 px-4 bg-secondary border border-border/50 text-muted-foreground rounded-2xl outline-none font-bold italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Rôle Système</label>
                    <input 
                      disabled
                      value={currentUser.role === 'admin' ? "Administrateur Principal" : "Gérant"}
                      className="w-full h-12 px-4 bg-secondary border border-border/50 text-muted-foreground rounded-2xl outline-none font-bold italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Langue d&apos;interface</label>
                    <select 
                      className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all appearance-none font-bold"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
               </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="space-y-6">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tighter">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    Préférences de Notification
                  </h2>
                  <div className="space-y-4">
                     {[
                        { id: "lowStock", label: "Alertes de stock faible", desc: "Recevoir un email quand un produit passe sous le seuil critique." },
                        { id: "dailyReports", label: "Rapports de ventes quotidiens", desc: "Résumé hebdomadaire de la performance boutique." },
                        { id: "newCustomers", label: "Nouveaux clients", desc: "Notification lors de la création d'un compte client." },
                        { id: "systemUpdates", label: "Mises à jour système", desc: "Informations sur les nouvelles fonctionnalités GestShop." },
                     ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl bg-muted/30 border border-border/50 group hover:bg-muted/50 transition-all">
                           <div className="space-y-1">
                              <p className="font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                           </div>
                           <div 
                              onClick={() => setNotifications({...notifications, [item.id]: !notifications[item.id as keyof typeof notifications]})}
                              className={cn(
                              "h-6 w-11 rounded-full p-1 cursor-pointer transition-all",
                              notifications[item.id as keyof typeof notifications] ? "bg-primary" : "bg-muted-foreground/30"
                           )}>
                              <div className={cn(
                                 "h-4 w-4 rounded-full bg-white transition-all shadow-sm",
                                 notifications[item.id as keyof typeof notifications] ? "translate-x-5" : "translate-x-0"
                              )} />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="space-y-6">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tighter">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    Modifier le mot de passe
                  </h2>
                  <div className="grid grid-cols-1 gap-6 max-w-md">
                     <div className="space-y-2 relative group">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Mot de passe actuel</label>
                        <input 
                          type={showCurrentPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={securityForm.currentPassword}
                          onChange={e => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                          className="w-full h-12 px-4 pr-12 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-[38px] text-zinc-500 hover:text-primary transition-colors focus:outline-none"
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                     </div>
                     <div className="space-y-2 relative group">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Nouveau mot de passe</label>
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={securityForm.newPassword}
                          onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})}
                          className="w-full h-12 px-4 pr-12 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-[38px] text-zinc-500 hover:text-primary transition-colors focus:outline-none"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                     </div>
                     <div className="space-y-2 relative group">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Confirmer le mot de passe</label>
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={securityForm.confirmPassword}
                          onChange={e => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                          className="w-full h-12 px-4 pr-12 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-[38px] text-zinc-500 hover:text-primary transition-colors focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                     </div>
                  </div>
               </div>

               <div className="pt-10 border-t border-border/50 space-y-6">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tighter">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    Double Authentification (2FA)
                  </h2>
                  <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
                     <Shield className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                     <div className="flex-1 space-y-2">
                        <p className="font-bold text-foreground">Sécurisez votre compte davantage</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                           L&apos;authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte en exigeant plus qu&apos;un simple mot de passe pour se connecter.
                        </p>
                        <button className="mt-2 text-xs font-black text-amber-600 uppercase tracking-widest hover:underline">
                           Activer maintenant
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <div className="pt-8 flex justify-end gap-4 border-t border-border/50">
             <button className="px-8 py-3 rounded-2xl bg-secondary text-foreground font-black text-sm hover:bg-secondary/80 transition-all">
               RÉINITIALISER
             </button>
             <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-10 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50"
             >
               {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
               {saving ? "SAUVEGARDE..." : "SAUVEGARDER"}
             </button>
          </div>
        </div>
      </div>

      <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} message="Vos paramètres ont été synchronisés avec succès." />
    </div>
  );
}
