"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface PopupWrapperProps {
  title: string;
  icon: React.ElementType;
  onClose: () => void;
  children: ReactNode;
  headerRight?: ReactNode;
}

export function PopupWrapper({ title, icon: Icon, onClose, children, headerRight }: PopupWrapperProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="mt-16 mr-4 w-80 bg-background rounded-xl shadow-2xl shadow-black/10 border border-border/60 overflow-hidden flex flex-col max-h-[80vh] transform transition-all animate-in fade-in slide-in-from-top-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-[13px] font-bold text-foreground tracking-tight">{title}</span>
            {headerRight}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
