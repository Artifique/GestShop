"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Package, Filter, Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SuccessDialog, ErrorDialog, DeleteDialog } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { productService } from "@/lib/services/productService";
import { categoryService } from "@/lib/services/categoryService";
import { Product, Category } from "@/lib/models/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    category_id: "",
    description: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      productService.getAll(),
      categoryService.getAll()
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setFormData({ name: "", sku: "", price: "", stock: "", category_id: categories[0]?.id || "", description: "" });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id || "",
      description: product.description || ""
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.sku || !formData.price) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      setShowError(true);
      return;
    }

    const success = await productService.create({
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0,
      category_id: formData.category_id || undefined,
      description: formData.description
    });

    if (success) {
      setSuccessMessage("Le produit a été ajouté avec succès.");
      setShowSuccess(true);
      setIsAddModalOpen(false);
      fetchData();
    } else {
      setErrorMessage("Erreur lors de la création du produit.");
      setShowError(true);
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    const success = await productService.update(selectedProduct.id, {
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0,
      category_id: formData.category_id || undefined,
      description: formData.description
    });

    if (success) {
      setSuccessMessage("Le produit a été mis à jour avec succès.");
      setShowSuccess(true);
      setIsEditModalOpen(false);
      fetchData();
    } else {
      setErrorMessage("Erreur lors de la modification du produit.");
      setShowError(true);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    const success = await productService.delete(selectedProduct.id);
    if (success) {
      setSuccessMessage("Le produit a été supprimé avec succès.");
      setShowSuccess(true);
      setIsDeleteModalOpen(false);
      fetchData();
    } else {
      setErrorMessage("Erreur lors de la suppression.");
      setShowError(true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight italic">Catalogue <span className="text-primary italic">Produits</span></h1>
          <p className="text-muted-foreground mt-1">Gérez votre inventaire et vos références produits avec précision.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card text-foreground border border-border hover:bg-muted transition-all shadow-sm">
            <Download className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm">Exporter</span>
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau Produit</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou SKU..." 
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
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest">SKU</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Catégorie</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-right">Prix</th>
                <th className="px-6 py-5 text-sm font-bold text-muted-foreground uppercase tracking-widest text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                         <p className="font-bold text-foreground text-lg leading-tight truncate">{product.name}</p>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                              {product.stock > 20 ? "En Stock" : product.stock > 0 ? "Stock Faible" : "Rupture"}
                            </span>
                         </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-black text-muted-foreground text-xs uppercase tracking-widest">{product.sku}</td>
                  <td className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest">
                      {categories.find(c => c.id === product.category_id)?.name || "Non classé"}
                  </td>
                  <td className="px-6 py-5 text-right text-foreground font-black text-lg">{product.price.toFixed(2)} €</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleOpenEdit(product)}
                        className="p-2.5 rounded-xl bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all border border-border/50 shadow-sm"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenDelete(product)}
                        className="p-2.5 rounded-xl bg-secondary hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-all border border-border/50 shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">Aucun produit trouvé.</td>
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-medium">
              Affichage de <span className="text-foreground font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> à <span className="text-foreground font-bold">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> sur <span className="text-foreground font-bold">{filteredProducts.length}</span> produits
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
      </div>

      {/* Modals */}
      <Modal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} title="Ajouter un Produit" onConfirm={handleAddProduct} confirmLabel="Ajouter au catalogue">
        <ProductForm data={formData} onChange={setFormData} categories={categories} />
      </Modal>

      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} title="Modifier le Produit" onConfirm={handleEditProduct} confirmLabel="Enregistrer les modifications">
        <ProductForm data={formData} onChange={setFormData} categories={categories} />
      </Modal>

      <DeleteDialog 
        open={isDeleteModalOpen} 
        onOpenChange={setIsDeleteModalOpen} 
        onConfirm={handleDeleteProduct}
        title="Supprimer le Produit"
        itemName={selectedProduct?.name || ""}
      />

      <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} message={successMessage} />
      <ErrorDialog open={showError} onOpenChange={setShowError} message={errorMessage} />
    </div>
  );
}

function ProductForm({ data, onChange, categories }: { data: any, onChange: (d: any) => void, categories: Category[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Désignation</label>
        <input 
          placeholder="Ex: T-Shirt Premium Cotton"
          className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold"
          value={data.name} onChange={e => onChange({...data, name: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Référence SKU</label>
          <input 
            placeholder="REF-000"
            className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold"
            value={data.sku} onChange={e => onChange({...data, sku: e.target.value})}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Prix de Vente (€)</label>
          <input 
            type="number"
            placeholder="0.00"
            className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold"
            value={data.price} onChange={e => onChange({...data, price: e.target.value})}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Description</label>
        <textarea 
          placeholder="Description du produit..."
          className="w-full p-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold min-h-[100px]"
          value={data.description} onChange={e => onChange({...data, description: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Stock Initial</label>
          <input 
            type="number"
            placeholder="0"
            className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold"
            value={data.stock} onChange={e => onChange({...data, stock: e.target.value})}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Catégorie</label>
          <select 
            className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold appearance-none"
            value={data.category_id} onChange={e => onChange({...data, category_id: e.target.value})}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}