"use client";

import { useState, useEffect } from "react";
import { X, Bell, Package, ShoppingCart, Loader2 } from "lucide-react";
import { apiGet } from "@/shared/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

interface Props {
  onClose: () => void;
}

function getIcon(type: string) {
  switch (type) {
    case "order": return ShoppingCart;
    case "product": return Package;
    default: return Bell;
  }
}

export function NotificationPopup({ onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Notification[]>("/notifications").then((res) => {
      if (res.data) setNotifications(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="mt-16 mr-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-950">Notifications</span>
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No notifications</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 8).map((n) => {
              const Icon = getIcon(n.type);
              return (
                <div key={n.id} className={`px-4 py-3 border-b border-slate-50 last:border-0 ${!n.is_read ? "bg-blue-50/40" : ""}`}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-950">{n.title}</p>
                      {n.message && <p className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</p>}
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
