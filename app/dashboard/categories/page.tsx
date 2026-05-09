"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Tag, Edit2, Trash2, Layers } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SuccessDialog, ErrorDialog, DeleteDialog } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { categoryService } from "@/lib/services/categoryService";
import { Category } from "@/lib/models/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({ name: "", description: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await categoryService.getAll();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = async () => {
    const success = await categoryService.create(formData);
    if (success) {
      setSuccessMessage("Catégorie créée avec succès.");
      setIsAddModalOpen(false);
      setShowSuccess(true);
      fetchData();
    }
  };

  const handleEdit = async () => {
    if (selectedCategory) {
      const success = await categoryService.update(selectedCategory.id, formData);
      if (success) {
        setSuccessMessage("Catégorie mise à jour avec succès.");
        setIsEditModalOpen(false);
        setShowSuccess(true);
        fetchData();
      }
    }
  };

  const handleDelete = async () => {
    if (selectedCategory) {
      const success = await categoryService.delete(selectedCategory.id);
      if (success) {
        setSuccessMessage("Catégorie supprimée avec succès.");
        setIsDeleteModalOpen(false);
        setShowSuccess(true);
        fetchData();
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight italic">Gestion des <span className="text-primary italic">Catégories</span></h1>
          <p className="text-muted-foreground mt-1">Organisez votre catalogue de vêtements par familles de produits.</p>
        </div>
        <button 
          onClick={() => { setFormData({ name: "", description: "" }); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      <div className="relative group w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher une catégorie..." 
          className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="glass-card rounded-[32px] p-8 group hover:translate-y-[-4px] transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Tag className="h-7 w-7" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleOpenEdit(category)} className="p-2.5 rounded-xl bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all border border-border/50">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleOpenDelete(category)} className="p-2.5 rounded-xl bg-secondary hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-all border border-border/50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-foreground tracking-tight mb-2">{category.name}</h3>
            <p className="text-sm text-muted-foreground font-medium mb-6 line-clamp-2 h-10">{category.description}</p>
            
            <div className="pt-6 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                <Layers className="h-4 w-4" />
                Détails
              </div>
              <button className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
                Voir les articles
              </button>
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-muted-foreground italic">Aucune catégorie trouvée.</div>
        )}
        {loading && (
          <div className="col-span-full py-20 text-center text-muted-foreground italic">Chargement...</div>
        )}
      </div>

      <Modal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} title="Nouvelle Catégorie" onConfirm={handleAdd} confirmLabel="Créer la catégorie">
        <CategoryForm formData={formData} setFormData={setFormData} />
      </Modal>

      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} title="Modifier la Catégorie" onConfirm={handleEdit} confirmLabel="Enregistrer">
        <CategoryForm formData={formData} setFormData={setFormData} />
      </Modal>

      <DeleteDialog 
        open={isDeleteModalOpen} 
        onOpenChange={setIsDeleteModalOpen} 
        onConfirm={handleDelete}
        title="Supprimer la Catégorie"
        itemName={selectedCategory?.name || ""}
      />

      <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} message={successMessage} />
    </div>
  );
}

function CategoryForm({ formData, setFormData }: { formData: { name: string; description: string }, setFormData: (d: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Nom de la catégorie</label>
        <input 
          placeholder="Ex: Chaussures de sport"
          className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Description</label>
        <textarea 
          placeholder="Décrivez brièvement les articles de cette catégorie..."
          className="w-full h-32 p-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium resize-none"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
    </div>
  );
}
