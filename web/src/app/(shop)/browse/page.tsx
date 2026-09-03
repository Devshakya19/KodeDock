import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/shared/lib/auth/server";
import { BrowseClientShell } from "./browse-client-shell";

interface BrowsePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    price?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("kodedock_token")?.value;
  const claims = token ? await verifyToken(token) : null;

  if (!claims) {
    redirect("/login");
  }

  const params = await searchParams;
  const searchQuery = params?.search || "";
  const categoryFilter = params?.category || "";
  const sortFilter = params?.sort || "popular";
  const priceFilter = params?.price || "";
  const fullName = claims.full_name || claims.email.split("@")[0];

  return (
    <BrowseClientShell
      email={claims.email}
      fullName={fullName}
      searchQuery={searchQuery}
      categoryFilter={categoryFilter}
      sortFilter={sortFilter}
      priceFilter={priceFilter}
    />
  );
}
