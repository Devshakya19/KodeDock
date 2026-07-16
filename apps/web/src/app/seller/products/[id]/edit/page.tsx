"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import { auth } from "@/shared/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

const CATEGORIES = [
  "Web Templates", "Mobile Apps", "UI Kits", "B.Tech Projects",
  "Boilerplates", "API Templates",
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("active");

  // Auth handled by custom auth client

  useEffect(() => {
    async function loadProduct() {
      try {
        const session = await auth.getSession();
        const res = await fetch(`${API_URL}/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${session?.token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const p = data.data;
          setTitle(p.title || "");
          setDescription(p.description || "");
          setPrice(p.price_paise ? (p.price_paise / 100).toString() : "");
          setCategory(p.category?.name || "");
          setGithubUrl(p.github_repo_url || "");
          setTags(p.tags?.join(", ") || "");
          setStatus(p.status || "active");
        }
      } catch {}
      setLoading(false);
    }
    loadProduct();
  }, [productId, auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const session = await auth.getSession();
      const res = await fetch(`${API_URL}/api/seller/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          title,
          description,
          price_paise: Math.round(parseFloat(price) * 100),
          status,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/seller/products"), 2000);
      } else {
        setError(result.error || "Failed to update product");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/seller/products" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to products
        </Link>
        <h1 className="text-2xl font-bold text-slate-950">Edit Product</h1>
      </div>

      <div className="max-w-2xl">
        <Card className="border-slate-200">
          <CardContent className="p-8">
            {success && (
              <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Product updated successfully
              </div>
            )}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="h-11 border-slate-300 bg-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹)</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="49" required className="h-11 border-slate-300 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 text-sm">
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={saving} className="bg-slate-950 text-white hover:bg-slate-800">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
                <Link href="/seller/products">
                  <Button type="button" variant="outline" className="border-slate-300 text-slate-700">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
