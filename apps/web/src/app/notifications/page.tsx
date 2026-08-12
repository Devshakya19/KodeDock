import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, Package, ShoppingCart, ArrowLeft, ArrowUpRight, DollarSign, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { verifyToken } from "@/shared/lib/server-auth";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

async function fetchNotifications(token: string) {
  try {
    const res = await fetch(`${RUST_BACKEND}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

function getNotificationConfig(type: string) {
  switch (type) {
    case "sale":
    case "order": 
      return { 
        icon: DollarSign, 
        colorClass: "bg-emerald-100 text-emerald-600",
        borderClass: "border-emerald-200/60"
      };
    case "product": 
      return { 
        icon: Package, 
        colorClass: "bg-blue-100 text-blue-600",
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
        colorClass: "bg-amber-100 text-amber-600",
        borderClass: "border-amber-200/60" 
      };
    default: 
      return { 
        icon: Bell, 
        colorClass: "bg-slate-100 text-slate-600",
        borderClass: "border-slate-200/60" 
      };
  }
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
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

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("codehaat_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const claims = await verifyToken(token);
  if (!claims) {
    redirect("/login");
  }

  const notifications = await fetchNotifications(token);
  const unreadCount = notifications.filter((n: Notification) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/seller" 
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200/60"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>
          <CodeHaatLogo href="/seller" />
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-[24px] p-2 sm:p-4 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] min-h-[60vh]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">All caught up!</h2>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                You have no new notifications. We'll alert you when there's an update.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Activity</span>
                {unreadCount > 0 && (
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Mark all as read
                  </button>
                )}
              </div>
              
              {notifications.map((notif: Notification) => {
                const { icon: Icon, colorClass, borderClass } = getNotificationConfig(notif.type);
                return (
                  <div 
                    key={notif.id} 
                    className={`group relative p-4 rounded-2xl transition-all flex items-start gap-4 ${
                      !notif.is_read 
                        ? "bg-blue-50/40 hover:bg-blue-50/60" 
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {!notif.is_read && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                    )}
                    
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${colorClass} ${borderClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-[15px] font-bold text-slate-900 leading-tight">
                          {notif.title}
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 flex-shrink-0 whitespace-nowrap mt-0.5">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>
                      
                      {notif.message && (
                        <p className={`text-[13px] leading-snug ${!notif.is_read ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                          {notif.message}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
