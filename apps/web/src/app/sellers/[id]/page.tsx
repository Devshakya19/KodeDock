import { auth } from "@/shared/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin } from "lucide-react";
import { GithubIcon } from "@/shared/components/github-icon";
import { Card, CardContent } from "@/shared/ui/card";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

async function getSellerProfile(sellerId: string) {
  try {
    const res = await fetch(`${API_URL}/api/profile/${sellerId}`);
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

async function getSellerProducts(sellerId: string) {
  try {
    const res = await fetch(`${API_URL}/api/seller/products`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export default async function SellerPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getSellerProfile(id);

  if (!profile) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/browse" className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <CodeHaatLogo href="/browse" />
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Header */}
        <Card className="border-slate-200 mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center text-2xl font-bold text-white">
                {profile.full_name?.[0]?.toUpperCase() || "S"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-950">{profile.full_name || "Seller"}</h1>
                {profile.bio && (
                  <p className="text-slate-600 mt-2">{profile.bio}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.github_username && (
                    <a
                      href={`https://github.com/${profile.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-slate-950"
                    >
                      <GithubIcon className="w-4 h-4" />
                      @{profile.github_username}
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-slate-950"
                    >
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller Products */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">Products</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Placeholder — in production, fetch seller's products */}
          <Card className="border-slate-200">
            <CardContent className="p-12 text-center">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Products will appear here</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
