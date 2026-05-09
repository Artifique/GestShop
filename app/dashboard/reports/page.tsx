"use client";

import React from "react";
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Calendar, Download, Filter, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useRouter } from "next/navigation";
import { saleService } from "@/lib/services/saleService";
import { authService } from "@/lib/services/authService";
import { useState, useEffect } from "react";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    async function checkAccess() {
      const p = await authService.getCurrentUser();
      if (p?.role !== 'admin') {
        router.push("/dashboard");
        return;
      }
      fetchReportData();
    }

    async function fetchReportData() {
      setLoading(true);
      const sales = await saleService.getDashboardStats();
      if (!sales) return;

      // 1. Weekly Revenue Data
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
      setWeeklyData(last7Days);

      // 2. Category Distribution Data
      const catMap: Record<string, number> = {};
      sales.forEach(sale => {
        sale.sale_items?.forEach((item: any) => {
          const catName = item.products?.categories?.name || 'Inconnu';
          const itemTotal = item.quantity * item.unit_price;
          catMap[catName] = (catMap[catName] || 0) + itemTotal;
        });
      });

      const formattedCatData = Object.entries(catMap).map(([name, value]) => ({
        name,
        value
      }));
      setCategoryData(formattedCatData.sort((a, b) => b.value - a.value));

      setLoading(false);
    }

    checkAccess();
  }, []);

  const reports = [
    { title: "Rapport de Ventes Quotidien", description: "Résumé des ventes et transactions pour la journée.", date: "08 Mai 2024", type: "Financier" },
    { title: "Analyse d'Inventaire", description: "État des stocks, articles à faible rotation et ruptures.", date: "07 Mai 2024", type: "Stock" },
    { title: "Performance des Produits", description: "Top 10 des produits les plus vendus ce mois-ci.", date: "01 Mai 2024", type: "Marketing" },
    { title: "Fidélité Client", description: "Analyse du comportement d'achat et taux de rétention.", date: "30 Avr 2024", type: "Clients" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight italic">Rapports & <span className="text-primary italic">Analyses</span></h1>
          <p className="text-muted-foreground mt-1">Générez et consultez des rapports détaillés sur votre activité.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card text-foreground border border-border shadow-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Derniers 30 jours</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-[32px] p-8 lg:col-span-2 min-h-[400px]">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-emerald-500" />
               Chiffre d&apos;Affaires Hebdomadaire
             </h3>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card rounded-[32px] p-8 flex flex-col items-center">
          <h3 className="text-xl font-bold text-foreground mb-6 self-start flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-violet-500" />
            Ventes par Catégorie
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3 w-full overflow-y-auto max-h-[150px] pr-2 custom-scrollbar">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex justify-between text-sm items-center p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-muted-foreground font-medium">{cat.name}</span>
                </div>
                <span className="text-foreground font-bold">{cat.value.toFixed(2)} €</span>
              </div>
            ))}
            {categoryData.length === 0 && (
              <p className="text-center text-muted-foreground text-xs italic py-4">Aucune donnée.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-foreground tracking-tight">Rapports Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, i) => (
            <div key={i} className="glass-card rounded-[24px] p-6 hover:translate-y-[-4px] transition-all group flex items-start gap-5">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-foreground">{report.title}</h4>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-3 py-1 rounded-full bg-primary/10">
                    {report.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{report.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-xs text-muted-foreground font-bold">{report.date}</span>
                  <button className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-2 group/btn">
                    <Download className="h-4 w-4 group-hover/btn:translate-y-0.5 transition-transform" />
                    Télécharger PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
