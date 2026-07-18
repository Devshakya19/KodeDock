import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, Package, ShoppingCart, ArrowLeft } from "lucide-react";
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

function getNotificationIcon(type: string) {
  switch (type) {
    case "order": return ShoppingCart;
    case "product": return Package;
    default: return Bell;
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/browse" className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-slate-950" />
              <span className="text-xl font-bold tracking-tight text-slate-950">Notifications</span>
            </div>
          </div>
          <CodeHaatLogo href="/browse" />
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-12 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-slate-950 mb-2">No notifications</h2>
              <p className="text-slate-500">You&apos;re all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif: Notification) => {
              const Icon = getNotificationIcon(notif.type);
              return (
                <Card key={notif.id} className={`border-slate-200 ${!notif.is_read ? "bg-blue-50/50" : ""}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-950">{notif.title}</div>
                      {notif.message && (
                        <div className="text-xs text-slate-500 mt-1">{notif.message}</div>
                      )}
                      <div className="text-[11px] text-slate-400 mt-1">
                        {new Date(notif.created_at).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
