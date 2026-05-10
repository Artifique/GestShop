"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, User, Shield, Mail, Key, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SuccessDialog, DeleteDialog, ErrorDialog } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/services/authService";
import { Profile } from "@/lib/models/types";
import { createUserAction, deleteUserAction, updateUserRoleAction } from "@/lib/actions/userActions";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    role: "admin" | "manager";
    password?: string;
  }>({
    full_name: "",
    email: "",
    role: "manager",
    password: ""
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const profiles = await authService.getAllProfiles();
    setUsers(profiles);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function checkAccess() {
      const p = await authService.getCurrentUser();
      if (p?.role !== 'admin') {
        router.push("/dashboard");
      } else {
        fetchData();
      }
    }
    checkAccess();
  }, [router, fetchData]);

  const handleOpenAdd = () => {
    setFormData({ full_name: "", email: "", role: "manager", password: "" });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: Profile) => {
    setSelectedUser(user);
    setFormData({ full_name: user.full_name || "", email: "", role: user.role, password: "" });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (user: Profile) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = async () => {
    setLoading(true);
    const result = await createUserAction(formData);
    setLoading(false);
    
    if (result.success) {
      setMessage("Utilisateur créé avec succès. Il peut maintenant se connecter.");
      setShowSuccess(true);
      setIsAddModalOpen(false);
      fetchData();
    } else {
      setMessage(result.error || "Une erreur est survenue.");
      setShowError(true);
    }
  };

  const handleEdit = async () => {
    if (selectedUser) {
      setLoading(true);
      // Mise à jour du rôle et du nom
      const result = await updateUserRoleAction(selectedUser.id, formData.role);
      
      // On met aussi à jour le profil pour le nom complet
      const success = await authService.updateProfile(selectedUser.id, {
        full_name: formData.full_name,
        role: formData.role
      });

      setLoading(false);

      if (result.success && success) {
        setMessage("Profil mis à jour avec succès.");
        setShowSuccess(true);
        setIsEditModalOpen(false);
        fetchData();
      } else {
        setMessage(result.error || "Erreur lors de la mise à jour.");
        setShowError(true);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      setLoading(true);
      const result = await deleteUserAction(selectedUser.id);
      setLoading(false);
      
      if (result.success) {
        setMessage("Utilisateur supprimé avec succès.");
        setShowSuccess(true);
        setIsDeleteModalOpen(false);
        fetchData();
      } else {
        setMessage(result.error || "Erreur lors de la suppression.");
        setShowError(true);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight italic">Gestion des <span className="text-primary italic">Utilisateurs</span></h1>
          <p className="text-muted-foreground mt-1">Gérez les accès des administrateurs et des gérants de la boutique.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter un Gérant</span>
        </button>
      </div>

      <div className="relative group w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un utilisateur..." 
          className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="glass-card rounded-[32px] p-8 group hover:translate-y-[-4px] transition-all relative overflow-hidden">
            <div className={cn(
              "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20",
              user.role === "admin" ? "bg-primary" : "bg-blue-500"
            )} />
            
            <div className="flex items-center justify-between mb-8">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110",
                user.role === "admin" ? "bg-primary/10 border-primary/20 text-primary" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
              )}>
                <User className="h-7 w-7" />
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                user.role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
              )}>
                {user.role === 'admin' ? 'Administrateur' : 'Gérant'}
              </span>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight leading-tight">{user.full_name || "Sans Nom"}</h3>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">{user.id.substring(0, 8)}...</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Dernière connexion : {user.last_login ? new Date(user.last_login).toLocaleString() : "N/A"}
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex items-center justify-between">
              <button className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
                <Key className="h-3.5 w-3.5" />
                Réinitialiser MDP
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleOpenEdit(user)} className="p-2 rounded-lg bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleOpenDelete(user)} className="p-2 rounded-lg bg-secondary hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-muted-foreground italic">Aucun utilisateur trouvé.</div>
        )}
        {loading && (
          <div className="col-span-full py-20 text-center text-muted-foreground italic">Chargement...</div>
        )}
      </div>

      <Modal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} title="Ajouter un Gérant" onConfirm={handleAdd} confirmLabel="Créer le compte">
        <UserForm data={formData} onChange={setFormData} />
      </Modal>

      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} title="Modifier le Compte" onConfirm={handleEdit} confirmLabel="Enregistrer">
        <UserForm data={formData} onChange={setFormData} isEdit />
      </Modal>

      <DeleteDialog 
        open={isDeleteModalOpen} 
        onOpenChange={setIsDeleteModalOpen} 
        onConfirm={handleDelete}
        title="Supprimer l'Utilisateur"
        itemName={selectedUser?.full_name || ""}
      />

      <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} message={message} />
      <ErrorDialog open={showError} onOpenChange={setShowError} message={message} />
    </div>
  );
}

function UserForm({ data, onChange, isEdit = false }: { 
  data: { full_name: string; email: string; role: "admin" | "manager"; password?: string }; 
  onChange: (d: any) => void; 
  isEdit?: boolean 
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Nom Complet</label>
        <input 
          className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold" 
          placeholder="Ex: Mamadou Traoré" 
          value={data.full_name} onChange={e => onChange({...data, full_name: e.target.value})}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Rôle</label>
        <select 
          className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold appearance-none"
          value={data.role} onChange={e => onChange({...data, role: e.target.value as any})}
        >
          <option value="manager">Gérant (Accès limité aux ventes/stock)</option>
          <option value="admin">Administrateur (Accès total)</option>
        </select>
      </div>
      {!isEdit && (
        <>
          <div className="grid gap-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Email professionnel</label>
            <input 
              className="w-full h-12 px-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold" 
              placeholder="Ex: mamadou@gestshop.ml" 
              value={data.email} onChange={e => onChange({...data, email: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Mot de passe provisoire</label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="password" 
                className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border/50 text-foreground rounded-2xl focus:border-primary outline-none transition-all font-bold" 
                value={data.password} onChange={e => onChange({...data, password: e.target.value})}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
