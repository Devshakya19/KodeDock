import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SellerNavbar } from "@/features/seller/components/seller-navbar";
import { verifyToken } from "@/shared/lib/server-auth";

export default async function SellerLayout({
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
      <SellerNavbar
        email={email}
        fullName={fullName}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
}
