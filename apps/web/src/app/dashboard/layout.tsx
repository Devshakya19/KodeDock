import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";

function decodeToken(token: string): { sub: string; email: string; role: string } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return { sub: decoded.sub, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("codehaat_token")?.value;

  if (!token || !decodeToken(token)) {
    redirect("/login");
  }

  const decoded = decodeToken(token!);
  const email = decoded?.email || "user@example.com";
  const fullName = email.split("@")[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar
        email={email}
        fullName={fullName}
      />
      <div className="md:ml-64">
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
