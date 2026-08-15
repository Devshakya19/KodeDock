import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { verifyToken } from "@/shared/lib/server-auth";
import { NotificationsList, Notification } from "@/features/notifications/components/notifications-list";

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
          <NotificationsList initialNotifications={notifications} />
        </div>
      </main>
    </div>
  );
}
