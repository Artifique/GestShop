"use client";

import React, { useState, useEffect } from "react";
import { Search, History, Filter, Download, Eye, FileText, Calendar, Package } from "lucide-react";
import { SuccessDialog, ErrorDialog } from "@/components/ui/alert-dialog";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { saleService } from "@/lib/services/saleService";
import { Sale, SaleItem } from "@/lib/models/types";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const data = await saleService.getAll();
    setSales(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetails = async (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
    const items = await saleService.getSaleItems(sale.id);
    setSaleItems(items);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredSales = sales.filter(s => 
    (s.customers?.name || "Client Passager").toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight italic">Historique des <span className="text-primary italic">Ventes</span></h1>
          <p className="text-muted-foreground mt-1">Consultez et gérez toutes les transactions passées.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card text-foreground border border-border shadow-sm"
          >
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">Actualiser</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par client ou N° facture..." 
            className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50">
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest">Référence</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest">Client</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Date</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-right">Montant</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Méthode</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedSales.map((sale) => (
                <tr key={sale.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-5">
                    <span className="font-black text-primary text-sm uppercase tracking-tighter">{sale.id.substring(0, 8)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                       <span className="font-bold text-foreground">{sale.customers?.name || "Client Passager"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center text-muted-foreground text-sm font-medium">
                    {sale.created_at ? new Date(sale.created_at).toLocaleString() : "N/A"}
                  </td>
                  <td className="px-6 py-5 text-right font-black text-foreground text-lg">{sale.total_amount.toFixed(2)} €</td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-secondary/50 text-muted-foreground border-border/50">
                      {sale.payment_method === 'cash' ? 'Espèces' : 'Carte'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenDetails(sale)}
                        className="p-2.5 rounded-xl bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all shadow-sm border border-border/50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedSales.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground italic">Aucune transaction trouvée.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground italic">Chargement...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-medium">
              Affichage de <span className="text-foreground font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> à <span className="text-foreground font-bold">{Math.min(currentPage * itemsPerPage, filteredSales.length)}</span> sur <span className="text-foreground font-bold">{filteredSales.length}</span> ventes
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

      <Modal open={isDetailsOpen} onOpenChange={setIsDetailsOpen} title={`Détails de la Vente`} confirmLabel="Fermer">
        {selectedSale && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Client</p>
                <p className="text-lg font-bold text-foreground">{selectedSale.customers?.name || "Client Passager"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Référence</p>
                <p className="text-lg font-mono text-primary font-bold">{selectedSale.id.substring(0, 8)}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Articles</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {saleItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.products?.name || "Produit inconnu"}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">Qté: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-foreground">{(item.unit_price * item.quantity).toFixed(2)} €</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-secondary rounded-2xl border border-border">
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">{selectedSale.total_amount.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
