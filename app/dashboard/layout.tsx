"use client";

import React from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Users, 
  Box, 
  Settings, 
  Bell, 
  Search,
  ChevronRight,
  LogOut,
  TrendingUp,
  Sun,
  Moon,
  Menu,
  X,
  CreditCard,
  Tag,
  Shield
} from "lucide-react";
import { useTheme } from "@/app/theme-provider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { authService } from "@/lib/services/authService";
import { productService } from "@/lib/services/productService";
import { Profile, Product } from "@/lib/models/types";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<Profile | null>(null);
  const [lowStockProducts, setLowStockProducts] = React.useState<Product[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    async function fetchData() {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      const prods = await productService.getAll();
      setLowStockProducts(prods.filter(p => p.stock <= 5));
    }
    fetchData();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.push("/auth/login");
  };

  const menuItems = [
    { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
    { name: "Ventes", href: "/dashboard/sales", icon: History },
    { name: "Point de Vente", href: "/dashboard/pos", icon: CreditCard },
    { name: "Produits", href: "/dashboard/products", icon: Package },
    { name: "Catégories", href: "/dashboard/categories", icon: Tag },
    { name: "Stock", href: "/dashboard/inventory", icon: Box },
    { name: "Clients", href: "/dashboard/customers", icon: Users },
    ...(user?.role === 'admin' ? [
      { name: "Utilisateurs", href: "/dashboard/users", icon: Shield },
      { name: "Rapports", href: "/dashboard/reports", icon: TrendingUp },
      { name: "Paramètres", href: "/dashboard/settings", icon: Settings }
    ] : [])
  ];

  const SidebarContent = () => (
    <div className="h-full bg-card flex flex-col border-r border-border shadow-2xl transition-all duration-300">
      {/* Logo */}
      <div className="p-8 pb-12 flex items-center gap-3">
         <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Box className="h-6 w-6 text-primary-foreground" />
         </div>
         <span className="text-xl font-bold text-foreground tracking-tight italic">GestShop</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <a 
            key={item.href} 
            href={item.href} 
            className="group flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 hover:bg-primary/10 text-muted-foreground hover:text-primary font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
               <item.icon className="h-5 w-5" />
            </div>
            <span className="tracking-tight">{item.name}</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </a>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 mt-auto border-t border-border/50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive font-medium"
        >
           <LogOut className="h-5 w-5" />
           <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 p-6 z-50 hidden lg:block">
        <div className="h-full rounded-[32px] overflow-hidden border border-border">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <div className="lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 border-none">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:pl-72 w-full min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 w-full p-4 lg:p-6">
           <div className="glass-card rounded-[24px] h-20 px-4 lg:px-8 flex items-center justify-between border border-border shadow-xl">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 lg:hidden text-muted-foreground"
                >
                  <Menu className="h-5 w-5" />
                </button>
                
                <div className="hidden md:flex items-center gap-4 bg-muted/50 rounded-2xl px-4 py-2 border border-border/50 w-64 lg:w-96 group focus-within:border-primary/50 transition-colors">
                   <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                   <input 
                      type="text" 
                      placeholder="Rechercher..." 
                      className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground font-medium"
                   />
                </div>
              </div>

              <div className="flex items-center gap-3 lg:gap-6">
                {/* Theme Toggle */}
                <button
                    className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors border border-border group"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    ) : (
                        <Moon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                </button>
                 <div className="relative hidden sm:block">
                   <button 
                     onClick={() => setShowNotifications(!showNotifications)}
                     className="relative p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors border border-border group"
                   >
                      <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      {lowStockProducts.length > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-background animate-pulse" />
                      )}
                   </button>

                   {showNotifications && (
                     <div className="absolute right-0 mt-3 w-80 bg-card border border-border/50 rounded-[24px] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                       <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                         <h4 className="font-bold text-foreground">Notifications</h4>
                         <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2.5 py-1 rounded-full font-black">
                           {lowStockProducts.length} alerte(s)
                         </span>
                       </div>
                       <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-2">
                         {lowStockProducts.length === 0 ? (
                           <div className="p-8 text-center text-muted-foreground">
                              <Bell className="h-8 w-8 mx-auto mb-3 opacity-20" />
                              <p className="text-sm font-medium">Aucune nouvelle notification.</p>
                           </div>
                         ) : (
                           lowStockProducts.map(p => (
                             <div key={p.id} className="p-3 mb-1 hover:bg-muted/50 rounded-xl transition-colors flex items-start gap-3 group/notif cursor-pointer" onClick={() => router.push('/dashboard/inventory')}>
                               <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                                 <Box className="h-5 w-5 text-rose-500" />
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-foreground leading-tight group-hover/notif:text-primary transition-colors">{p.name}</p>
                                 <p className="text-xs text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    Stock critique: {p.stock} restant(s)
                                 </p>
                               </div>
                             </div>
                           ))
                         )}
                       </div>
                       <div className="p-3 border-t border-border/50 text-center bg-muted/30">
                         <a href="/dashboard/inventory" className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors">Gérer l'inventaire</a>
                       </div>
                     </div>
                   )}
                 </div>
                 <div className="h-10 w-[1px] bg-border/50 mx-1 lg:mx-2 hidden sm:block" />
                 <div className="flex items-center gap-3 pl-1 lg:pl-2">
                    <div className="text-right hidden xl:block">
                       <p className="text-sm font-bold text-foreground">{user?.full_name || "Invité"}</p>
                       <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{user?.role === 'admin' ? 'Administrateur' : 'Gérant'}</p>
                    </div>
                    <div className="h-10 w-10 lg:h-11 lg:w-11 rounded-xl bg-gradient-to-tr from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center font-bold text-primary shadow-inner">
                       {user?.full_name?.split(' ').map(n => n[0]).join('') || "U"}
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 pt-2 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}

