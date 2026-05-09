"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect rounded-xl p-6 border border-border">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 text-white"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </button>
          )}
        </DialogFooter>
        <button
          className="absolute top-4 right-4 text-zinc-400 hover:text-foreground"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
}

