"use client";

import React, { useState, useEffect } from "react";
import { Search, Box, ArrowUpRight, AlertTriangle, Filter, RefreshCw, Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SuccessDialog, ErrorDialog } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { productService } from "@/lib/services/productService";
import { Product } from "@/lib/models/types";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newStock, setNewStock] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const data = await productService.getAll();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredItems = products.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdjustment = (product: Product) => {
    setSelectedProduct(product);
    setNewStock(product.stock.toString());
    setIsAdjustmentOpen(true);
  };

  const handleAdjust = async () => {
    if (!selectedProduct) return;
    const stockValue = parseInt(newStock);
    if (isNaN(stockValue)) {
      setErrorMessage("Veuillez entrer un nombre valide.");
      setShowError(true);
      return;
    }

    const success = await productService.update(selectedProduct.id, { stock: stockValue });
    if (success) {
      setSuccessMessage("Stock mis à jour avec succès.");
      setShowSuccess(true);
      setIsAdjustmentOpen(false);
      fetchData();
    } else {
      setErrorMessage("Erreur lors de la mise à jour du stock.");
      setShowError(true);
    }
  };

  const stats = {
    totalItems: products.length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock <= 0).length,
    totalValue: products.reduce((acc, p) => acc + (p.price * p.stock), 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight italic">Gestion du <span className="text-primary italic">Stock</span></h1>
          <p className="text-muted-foreground mt-1">Suivez vos niveaux de stock en temps réel et gérez les réapprovisionnements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card text-foreground border border-border hover:bg-muted transition-all shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4 text-primary", loading && "animate-spin")} />
            <span className="font-bold text-sm">Actualiser</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Références", value: stats.totalItems, icon: Box, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Alertes Stock", value: stats.lowStock + stats.outOfStock, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Valeur du stock", value: `${stats.totalValue.toFixed(2)} €`, icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-[28px] p-6 group hover:translate-y-[-4px] transition-all">
            <div className="flex items-center gap-4">
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", stat.bg)}>
                <stat.icon className={cn("h-7 w-7", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">{stat.label}</p>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une référence ou SKU..." 
            className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-card border border-border text-foreground hover:bg-muted transition-all shadow-sm w-full md:w-auto">
          <Filter className="h-5 w-5 text-primary" />
          <span className="font-bold">Filtres</span>
        </button>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50">
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest">Produit</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Quantité</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Statut</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground text-lg">{item.name}</span>
                      <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">{item.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-foreground">{item.stock}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      item.stock > 10 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                      item.stock > 0 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                      "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    )}>
                      {item.stock > 10 ? "Optimal" : item.stock > 0 ? "Faible" : "Rupture"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleOpenAdjustment(item)}
                      className="px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm"
                    >
                      Ajuster le Stock
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground italic">Aucun article trouvé.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground italic">Chargement...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-medium">
              Affichage de <span className="text-foreground font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> à <span className="text-foreground font-bold">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> sur <span className="text-foreground font-bold">{filteredItems.length}</span> articles
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-all"
              >
                Précédent
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen} title="Ajustement de Stock" onConfirm={handleAdjust} confirmLabel="Mettre à jour">
        <div className="space-y-6">
          {selectedProduct && (
            <div className="p-5 bg-primary/5 border border-primary/20 rounded-[20px] flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                 <Box className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-tight">{selectedProduct.name}</p>
                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{selectedProduct.sku}</p>
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Nouveau niveau de stock</label>
            <input 
              type="number" 
              className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold" 
              placeholder="Ex: 50" 
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Motif de l&apos;ajustement</label>
            <select className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold appearance-none">
              <option>Inventaire cyclique</option>
              <option>Réception de commande</option>
              <option>Retour client</option>
              <option>Perte / Vol</option>
              <option>Correction d&apos;erreur</option>
            </select>
          </div>
        </div>
      </Modal>

      <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} message={successMessage} />
      <ErrorDialog open={showError} onOpenChange={setShowError} message={errorMessage} />
    </div>
  );
}
