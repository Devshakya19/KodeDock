import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin } from "lucide-react";
import { GithubIcon } from "@/shared/components/github-icon";
import { Card, CardContent } from "@/shared/ui/card";
import { CodeHaatLogo } from "@/shared/components/codehaat-logo";
import { serverApiGet } from "@/shared/lib/auth";

interface SellerProfile {
  id: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  github_username: string | null;
  website: string | null;
  avatar_url: string | null;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  rating: number;
  review_count: number;
  sales_count: number;
  tags: string[];
  image_url: string | null;
}

async function getSellerProfile(sellerId: string): Promise<SellerProfile | null> {
  try {
    const res = await serverApiGet<SellerProfile>(`/profile/${sellerId}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}

async function getSellerProducts(sellerId: string): Promise<Product[]> {
  try {
    const res = await serverApiGet<Product[]>("/seller/products");
    return res.data ?? [];
  } catch {
    return [];
  }
}

export default async function SellerPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, products] = await Promise.all([
    getSellerProfile(id),
    getSellerProducts(id),
  ]);

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
        <Card className="border-slate-200 mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-20 h-20 object-cover" />
                ) : (
                  profile.full_name?.[0]?.toUpperCase() || "S"
                )}
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

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">Products ({products.length})</h2>
        </div>

        {products.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-12 text-center">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No products listed yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="group border border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all cursor-pointer h-full">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-950 text-sm line-clamp-2">{product.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-base font-bold text-slate-950">
                        INR {(product.price_paise / 100).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {product.rating?.toFixed(1) || "0.0"} stars ({product.review_count})
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
