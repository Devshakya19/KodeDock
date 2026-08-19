import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { verifyToken } from "@/lib/auth/server";
import { theme } from "@/lib/theme";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("kodedock_token")?.value;

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
    <div className="flex-1">
      <Navbar
        variant="seller"
        email={email}
        fullName={fullName}
      />
      <main className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-4 md:py-8">
        {children}
      </main>
    </div>
  );
}
