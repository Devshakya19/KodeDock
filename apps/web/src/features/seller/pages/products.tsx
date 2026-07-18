import { getServerUser, serverApiGet } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

interface SellerProduct {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  category_name: string | null;
  status: string;
  image_url: string | null;
  sales_count: number;
}

export default async function ProductsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const res = await serverApiGet<SellerProduct[]>("/seller/products");
  const products = res.data ?? [];

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Products</h1>
          <p className="text-slate-600 mt-1">Manage your listed products</p>
        </div>
        <Link href="/seller/products/new">
          <Button className="bg-slate-950 text-white hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950 mb-2">No products yet</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              Start selling by listing your first product.
            </p>
            <Link href="/seller/products/new">
              <Button className="bg-slate-950 text-white hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" />
                List Your First Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Link key={product.id} href={`/seller/products/${product.id}/edit`}>
              <Card className="border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Product image */}
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-950 truncate">{product.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{product.description || "No description"}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant={product.status === "active" ? "default" : "secondary"}
                          className={`text-[10px] ${
                            product.status === "active"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {product.status}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {product.category_name || "Uncategorized"}
                        </span>
                      </div>
                    </div>
                    {/* Price & sales */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-slate-950">
                        INR {(product.price_paise / 100).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {product.sales_count || 0} sales
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
