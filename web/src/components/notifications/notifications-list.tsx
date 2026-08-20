"use client";

import { useState } from "react";
import { Bell, Package, ArrowUpRight, DollarSign, Sparkles } from "lucide-react";
import { apiPut } from "@/shared/lib/api/client";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

function getNotificationConfig(type: string) {
  switch (type) {
    case "sale":
    case "order": 
      return { 
        icon: DollarSign, 
        colorClass: "bg-success/20 text-success",
        borderClass: "border-emerald-200/60"
      };
    case "product": 
      return { 
        icon: Package, 
        colorClass: "bg-accent/20 text-accent",
        borderClass: "border-blue-200/60" 
      };
    case "payout": 
      return { 
        icon: ArrowUpRight, 
        colorClass: "bg-purple-100 text-purple-600",
        borderClass: "border-purple-200/60" 
      };
    case "system": 
      return { 
        icon: Sparkles, 
        colorClass: "bg-warning/20 text-warning",
        borderClass: "border-amber-200/60" 
      };
    default: 
      return { 
        icon: Bell, 
        colorClass: "bg-secondary text-muted-foreground",
        borderClass: "border-border/60" 
      };
  }
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function NotificationsList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    
    // API call
    try {
      await apiPut("/notifications/read-all", {});
    } catch (e) {
      // Revert if failed (simple version doesn't revert for now to keep code clean)
    }
  };

  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    
    // API call
    try {
      await apiPut(`/notifications/${id}/read`, {});
    } catch (e) {
      // Revert omitted
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4 border border-border">
          <Bell className="w-8 h-8 text-muted-foreground/80" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">All caught up!</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          You have no new notifications. We'll alert you when there's an update.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border mb-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</span>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-accent hover:text-blue-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {notifications.map((notif) => {
        const { icon: Icon, colorClass, borderClass } = getNotificationConfig(notif.type);
        return (
          <div 
            key={notif.id} 
            onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
            className={`group relative p-4 rounded-2xl transition-all flex items-start gap-4 ${
              !notif.is_read 
                ? "bg-blue-50/40 hover:bg-blue-50/60 cursor-pointer" 
                : "hover:bg-secondary"
            }`}
          >
            {!notif.is_read && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />
            )}
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${colorClass} ${borderClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-[15px] font-bold text-foreground leading-tight">
                  {notif.title}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground flex-shrink-0 whitespace-nowrap mt-0.5">
                  {formatRelativeTime(notif.created_at)}
                </span>
              </div>
              
              {notif.message && (
                <p className={`text-[13px] leading-snug ${!notif.is_read ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {notif.message}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
