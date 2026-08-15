import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardNavbar } from "@/features/dashboard/components/dashboard-navbar";
import { verifyToken } from "@/shared/lib/server-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("codehaat_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const claims = await verifyToken(token);
  if (!claims) {
    redirect("/login");
  }

  const email = claims.email;
  const fullName = claims.full_name || email.split("@")[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNavbar
        email={email}
        fullName={fullName}
      />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
