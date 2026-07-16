import { auth } from "@/shared/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Package, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Auth handled by custom auth client
  const user = await auth.getUser();
  if (!user) redirect("/login");

  // Fetch order (simplified — in production would use API)
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/dashboard/purchases" className="flex items-center gap-2 text-slate-600 hover:text-slate-950">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Purchases</span>
          </Link>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-950 mb-2">Order Confirmed!</h1>
            <p className="text-slate-600 mb-2">Order #{id.slice(0, 8)}</p>
            <p className="text-sm text-slate-500 mb-6">
              Your code has been delivered to your GitHub account. Check your email for the repo link.
            </p>

            <div className="space-y-3">
              <Link href="/browse">
                <Button className="w-full bg-slate-950 text-white hover:bg-slate-800">
                  Browse More Products
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full border-slate-300 text-slate-700">
                  View Purchase History
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
