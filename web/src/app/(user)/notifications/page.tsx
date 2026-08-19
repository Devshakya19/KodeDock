import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KodeDockLogo } from "@/components/brand/kodedock-logo";
import { verifyToken } from "@/lib/auth/server";
import { NotificationsList, Notification } from "@/components/notifications/notifications-list";
import { theme } from "@/lib/theme";

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
  const token = cookieStore.get("kodedock_token")?.value;

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
    <div className="flex-1">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-[24px] p-2 sm:p-4 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] min-h-[60vh]">
          <NotificationsList initialNotifications={notifications} />
        </div>
      </main>
    </div>
  );
}
