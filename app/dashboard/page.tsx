"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Users, DollarSign, PackageOpen, ArrowUpRight, ArrowDownRight, CreditCard, Activity } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { productService } from "@/lib/services/productService";
import { customerService } from "@/lib/services/customerService";
import { saleService } from "@/lib/services/saleService";

export default function DashboardPage() {
  const [statsData, setStatsData] = useState({
    revenue: 0,
    customers: 0,
    sales: 0,
    products: 0
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [prods, custs, sales] = await Promise.all([
        productService.getAll(),
        customerService.getAll(),
        saleService.getAll()
      ]);

      const totalRevenue = sales.reduce((acc, s) => acc + s.total_amount, 0);
      
      setStatsData({
        revenue: totalRevenue,
        customers: custs.length,
        sales: sales.length,
        products: prods.length
      });

      setRecentSales(sales.slice(0, 5));

      // Group sales by day of week for the last 7 days
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toISOString().split('T')[0],
          name: days[d.getDay()],
          revenue: 0
        };
      });

      sales.forEach(sale => {
        if (sale.created_at) {
          const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
          const dayData = last7Days.find(d => d.date === saleDate);
          if (dayData) {
            dayData.revenue += sale.total_amount;
          }
        }
      });

      setChartData(last7Days);
      setLoading(false);
    }
    fetchData();
  }, []);

  const stats = [
    {
      title: "Revenu Total",
      value: `${statsData.revenue.toFixed(2)} €`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-emerald-500/20 to-emerald-500/5",
      textColor: "text-emerald-500"
    },
    {
      title: "Clients",
      value: statsData.customers.toString(),
      change: "+3.2%",
      trend: "up",
      icon: Users,
      color: "from-blue-500/20 to-blue-500/5",
      textColor: "text-blue-500"
    },
    {
      title: "Ventes",
      value: statsData.sales.toString(),
      change: "+8.1%",
      trend: "up",
      icon: CreditCard,
      color: "from-violet-500/20 to-violet-500/5",
      textColor: "text-violet-500"
    },
    {
      title: "Produits Actifs",
      value: statsData.products.toString(),
      change: "+2.4%",
      trend: "up",
      icon: PackageOpen,
      color: "from-orange-500/20 to-orange-500/5",
      textColor: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1 italic">Vue d'<span className="text-primary italic">ensemble</span></h1>
          <p className="text-muted-foreground font-medium">Voici ce qui se passe dans votre boutique aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/pos">
            <button className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
              Nouvelle Vente
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-[28px] p-6 hover:translate-y-[-4px] group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{stat.title}</span>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} border border-white/10 shadow-sm`}>
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className={`flex items-center font-black px-2 py-0.5 rounded-full ${stat.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {stat.change}
              </span>
              <span className="text-muted-foreground font-medium">vs mois dernier</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid gap-6 md:grid-cols-7 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200 fill-mode-both">
        <div className="md:col-span-4 glass-card rounded-[32px] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Évolution des Revenus
            </h3>
            <div className="flex gap-2">
               <button className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold hover:bg-secondary/80 transition-colors">Hebdomadaire</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}}
                  itemStyle={{color: 'hsl(var(--foreground))'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevDash)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-3 glass-card rounded-[32px] p-8">
          <h3 className="text-xl font-black text-foreground mb-8">Flux de Ventes</h3>
          <div className="space-y-6">
            {recentSales.map((sale, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer p-2 rounded-2xl hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-secondary to-muted flex items-center justify-center text-foreground font-black border border-border group-hover:scale-110 transition-all shadow-sm">
                    {(sale.customers?.name || "C").charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{sale.customers?.name || "Client Passager"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(sale.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">+{sale.total_amount.toFixed(2)} €</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Payé</p>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && !loading && (
              <p className="text-center text-muted-foreground italic py-10">Aucune vente récente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}