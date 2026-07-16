import { cookies } from "next/headers";
import { SellerNavbar } from "@/features/seller/components/seller-navbar";

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

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("codehaat_token")?.value;
  const decoded = token ? decodeToken(token) : null;
  const email = decoded?.email || "user@example.com";
  const fullName = email.split("@")[0];

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
