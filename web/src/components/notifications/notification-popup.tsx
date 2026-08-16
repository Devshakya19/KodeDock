"use client";

import { useState, useEffect } from "react";
import { X, Bell, Package, ShoppingCart, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api/client";

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

import { PopupWrapper } from "@/components/ui/popup-wrapper";

export function NotificationPopup({ onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Notification[]>("/notifications").then((res) => {
      if (res.data) setNotifications(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <PopupWrapper 
      title="Notifications" 
      icon={Bell} 
      onClose={onClose}
    >

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
    </PopupWrapper>
  );
}
