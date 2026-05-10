"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { SuccessDialog, ErrorDialog } from "@/components/ui/alert-dialog";
import { Plus, ShoppingCart, Search, Trash2, CreditCard, User, Package, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { productService } from "@/lib/services/productService";
import { customerService } from "@/lib/services/customerService";
import { saleService } from "@/lib/services/saleService";
import { authService } from "@/lib/services/authService";
import { Product, Customer, Profile } from "@/lib/models/types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface CartItem extends Product {
  quantity: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [prods, custs, user] = await Promise.all([
      productService.getAll(),
      customerService.getAll(),
      authService.getCurrentUser()
    ]);
    setProducts(prods);
    setCustomers(custs);
    setCurrentUser(user);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        setErrorMessage("Stock insuffisant !");
        setErrorOpen(true);
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      if (product.stock <= 0) {
        setErrorMessage("Produit en rupture de stock !");
        setErrorOpen(true);
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        const product = products.find(p => p.id === productId);
        if (newQty > 0 && product && newQty <= product.stock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // Simplified for now

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!currentUser) {
      setErrorMessage("Vous devez être connecté pour effectuer une vente.");
      setErrorOpen(true);
      return;
    }

    const saleData = {
      customer_id: selectedCustomerId || undefined,
      seller_id: currentUser.id,
      total_amount: total,
      payment_method: paymentMethod,
    };

    const saleItems = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const success = await saleService.createSale(saleData, saleItems);

    if (success) {
      // Generate Receipt
      try {
        const doc = new jsPDF({ format: [80, 200] });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("GESTSHOP", 40, 10, { align: "center" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Ticket de caisse", 40, 16, { align: "center" });
        doc.text(`Date: ${new Date().toLocaleString()}`, 40, 22, { align: "center" });
        
        let customerName = "Client de passage";
        if (selectedCustomerId) {
          const c = customers.find(c => c.id === selectedCustomerId);
          if (c) customerName = c.name;
        }
        doc.text(`Client: ${customerName}`, 5, 32);
        
        const tableRows = cart.map(item => [
          item.name.substring(0, 15),
          item.quantity.toString(),
          `${item.price.toFixed(2)}`,
          `${(item.quantity * item.price).toFixed(2)}`
        ]);
        
        autoTable(doc, {
          head: [["Article", "Qte", "PU", "Total"]],
          body: tableRows,
          startY: 38,
          theme: "plain",
          styles: { fontSize: 8, cellPadding: 1 },
          headStyles: { fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 10, halign: 'center' },
            2: { cellWidth: 15, halign: 'right' },
            3: { cellWidth: 15, halign: 'right' }
          },
          margin: { left: 5, right: 5 }
        });
        
        const finalY = (doc as any).lastAutoTable.finalY || 40;
        
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL: ${total.toFixed(2)} EUR`, 75, finalY + 10, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.text(`Paiement: ${paymentMethod === 'cash' ? 'Espèces' : 'Carte'}`, 75, finalY + 15, { align: "right" });
        
        doc.setFontSize(8);
        doc.text("Merci de votre visite !", 40, finalY + 25, { align: "center" });
        
        // Open PDF in new tab and prompt print
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
      } catch (err) {
        console.error("Erreur facture", err);
      }

      setSuccessOpen(true);
      setCart([]);
      setSelectedCustomerId("");
      // Refresh products to show new stock
      const updatedProds = await productService.getAll();
      setProducts(updatedProds);
    } else {
      setErrorMessage("Erreur lors de l'enregistrement de la vente.");
      setErrorOpen(true);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 overflow-hidden animate-in fade-in duration-700">
      {/* Left Area: Product Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight italic">Point de <span className="text-primary italic">Vente</span></h1>
            <p className="text-muted-foreground mt-1">Sélectionnez les produits pour le nouveau panier.</p>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher un produit (Nom ou SKU)..." 
            className="w-full h-14 pl-12 pr-4 bg-card border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
            {filteredProducts.map((product) => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={cn(
                  "relative flex flex-col rounded-[20px] border border-border/50 bg-card overflow-hidden transition-all duration-300 text-left group",
                  product.stock <= 0 
                    ? "opacity-60 grayscale cursor-not-allowed" 
                    : "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
                )}
              >
                {/* Image Section */}
                <div className="relative h-40 w-full bg-muted/30 overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
                      <Package className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                  )}
                  {/* Stock Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={cn(
                      "backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-full border shadow-sm tracking-wide",
                      product.stock > 10 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                        : product.stock > 0
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    )}>
                      {product.stock <= 0 ? "Rupture" : `${product.stock} dispo`}
                    </span>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center">
                      <Plus className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1">
                    {product.name}
                  </h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                    {product.sku}
                  </p>
                  
                  <div className="mt-auto pt-3 border-t border-border/50 flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">Prix</span>
                      <span className="text-xl font-black text-foreground tracking-tighter">
                        {product.price.toFixed(2)} <span className="text-primary text-sm font-bold">€</span>
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area: Cart & Checkout */}
      <div className="w-full lg:w-[380px] flex flex-col gap-4">
        <div className="glass-card rounded-[24px] p-5 flex-1 flex flex-col shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2 uppercase tracking-tighter">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Panier Actuel
            </h3>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black">{cart.length} Articles</span>
          </div>

          <div className="mb-4 space-y-3 shrink-0">
             <div className="grid gap-1.5">
               <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Client</label>
               <select 
                 className="w-full h-10 px-3 text-sm bg-muted/50 border border-border/50 text-foreground rounded-xl focus:border-primary outline-none transition-all font-bold appearance-none"
                 value={selectedCustomerId}
                 onChange={(e) => setSelectedCustomerId(e.target.value)}
               >
                 <option value="">Client de passage</option>
                 {customers.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
             </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground text-xs truncate">{item.name}</h4>
                  <p className="text-primary font-black text-xs">{item.price.toFixed(2)} €</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-lg bg-muted hover:bg-border transition-colors">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-lg bg-muted hover:bg-border transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-muted-foreground hover:text-rose-500 transition-colors ml-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground italic">
                <ShoppingCart className="h-10 w-10 mb-3 opacity-10" />
                <p className="text-sm">Panier vide</p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50 shrink-0">
            <div className="grid gap-2">
               <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Paiement</label>
               <div className="flex gap-2">
                 {['cash', 'card'].map((method) => (
                   <button 
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-widest transition-all",
                      paymentMethod === method ? "bg-primary/10 border-primary text-primary" : "bg-muted/30 border-border/50 text-muted-foreground"
                    )}
                   >
                     {method === 'cash' ? 'Espèces' : 'Carte'}
                   </button>
                 ))}
               </div>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pb-1">Total à payer</span>
              <span className="text-3xl font-black text-primary tracking-tighter">{total.toFixed(2)} €</span>
            </div>
            
            <button 
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="h-5 w-5" />
              Payer
            </button>
          </div>
        </div>
      </div>

      <SuccessDialog 
        open={successOpen} 
        onOpenChange={setSuccessOpen} 
        message="Vente enregistrée avec succès. La facture est générée." 
      />
      <ErrorDialog open={errorOpen} onOpenChange={setErrorOpen} message={errorMessage} />
    </div>
  );
}