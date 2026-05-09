"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
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
  className,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("glass-card rounded-2xl p-6 overflow-hidden", className)}>
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-bold">{title}</DialogTitle>
          {description && <DialogDescription className="text-muted-foreground">{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-border/20">
          <button
            className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all font-medium"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
