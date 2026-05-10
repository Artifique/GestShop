"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, User, Mail, Phone, MapPin, Edit2, Trash2, Filter } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SuccessDialog, ErrorDialog, DeleteDialog } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { customerService } from "@/lib/services/customerService";
import { Customer } from "@/lib/models/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await customerService.getAll();
    setCustomers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setFormData({ name: "", email: "", phone: "", address: "" });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || ""
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedCustomer) {
      const success = await customerService.delete(selectedCustomer.id);
      if (success) {
        setSuccessMessage("Client supprimé avec succès.");
        setIsDeleteModalOpen(false);
        setShowSuccess(true);
        fetchData();
      }
    }
  };

  const handleSave = async () => {
    if (selectedCustomer) {
      const success = await customerService.update(selectedCustomer.id, formData);
      if (success) {
        setSuccessMessage("Client mis à jour avec succès.");
        setIsEditModalOpen(false);
        setShowSuccess(true);
        fetchData();
      }
    } else {
      const success = await customerService.create(formData);
      if (success) {
        setSuccessMessage("Nouveau client créé avec succès.");
        setIsAddModalOpen(false);
        setShowSuccess(true);
        fetchData();
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight italic">Gestion des <span className="text-primary italic">Clients</span></h1>
          <p className="text-muted-foreground mt-1">Gérez votre base de données clients et suivez leur activité.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau Client</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email ou téléphone..." 
            className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-card border border-border text-foreground hover:bg-muted transition-all shadow-sm w-full md:w-auto shrink-0">
          <Filter className="h-5 w-5 text-primary" />
          <span className="font-bold">Segmenter</span>
        </button>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50">
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest">Client</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest">Coordonnées</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest">Adresse</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-right">Activité</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center border border-primary/20 shadow-inner">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg leading-tight">{customer.name}</p>
                        <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black mt-0.5">Client Fidèle</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {customer.email || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {customer.phone || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-[200px]">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{customer.address || "Non renseignée"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-primary">{customer.total_spent.toFixed(2)} FCFA</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Dernier : {customer.last_order ? new Date(customer.last_order).toLocaleDateString() : "Jamais"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleOpenEdit(customer)}
                        className="p-2.5 rounded-xl bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all border border-border/50 shadow-sm"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenDelete(customer)}
                        className="p-2.5 rounded-xl bg-secondary hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-all border border-border/50 shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedCustomers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">Aucun client trouvé.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">Chargement...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            Affichage de <span className="text-foreground font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> à <span className="text-foreground font-bold">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> sur <span className="text-foreground font-bold">{filteredCustomers.length}</span> clients
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-all"
            >
              Précédent
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                    currentPage === page 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
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

      <Modal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} title="Ajouter un Client" onConfirm={handleSave} confirmLabel="Créer le client">
        <CustomerForm data={formData} onChange={setFormData} />
      </Modal>

      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} title="Modifier le Client" onConfirm={handleSave} confirmLabel="Enregistrer les modifications">
        <CustomerForm data={formData} onChange={setFormData} />
      </Modal>

      <DeleteDialog 
        open={isDeleteModalOpen} 
        onOpenChange={setIsDeleteModalOpen} 
        onConfirm={handleDelete}
        title="Supprimer le Client"
        itemName={selectedCustomer?.name || ""}
      />

      <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} message={successMessage} />
    </div>
  );
}

function CustomerForm({ data, onChange }: { data: { name: string; email: string; phone: string; address: string }, onChange: (d: any) => void }) {
  return (
    <div className="space-y-6">
       <div className="grid gap-2">
         <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Nom complet</label>
         <input 
           className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold" 
          placeholder="Ex: Amadou Diallo" 
           value={data.name} onChange={e => onChange({...data, name: e.target.value})}
         />
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="grid gap-2">
           <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Email</label>
           <input 
             className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold" 
             placeholder="amadou@gmail.com" 
             value={data.email} onChange={e => onChange({...data, email: e.target.value})}
           />
         </div>
         <div className="grid gap-2">
           <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Téléphone</label>
           <input 
             className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold" 
             placeholder="06 12 34 56 78" 
             value={data.phone} onChange={e => onChange({...data, phone: e.target.value})}
           />
         </div>
       </div>
       <div className="grid gap-2">
         <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Adresse physique</label>
         <input 
           className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold" 
          placeholder="Ex: ACI 2000, Bamako" 
           value={data.address} onChange={e => onChange({...data, address: e.target.value})}
         />
       </div>
    </div>
  );
}
