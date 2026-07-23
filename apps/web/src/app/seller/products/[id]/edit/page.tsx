"use client";
import { GithubIcon } from "@/shared/components/github-icon";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle, Upload, Star, X, Eye, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { apiGet, apiPut, apiDelete } from "@/shared/lib/api";
import { uploadFile } from "@/shared/lib/upload";

const CATEGORIES = [
  "Web Templates", "Mobile Apps", "UI Kits", "B.Tech Projects",
  "Boilerplates", "API Templates",
];

interface Product {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  category_name: string | null;
  tags: string[];
  github_repo_url: string;
  image_url: string | null;
  status: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState("active");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await apiGet<any[]>("/seller/products");
        const products = res.data;
        const p = products?.find((prod: any) => prod.id === productId);
        if (p) {
          setTitle(p.title || "");
          setDescription(p.description || "");
          setPrice(p.price_paise ? (p.price_paise / 100).toString() : "");
          setCategory(p.category_name || "");
          setGithubUrl(p.github_repo_url || "");
          setTags(p.tags?.join(", ") || "");
          setImageUrl(p.image_url || "");
          setImagePreview(p.image_url || null);
          setStatus(p.status || "active");
        }
      } catch {}
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be less than 5MB"); return; }

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setUploading(true);
    setError("");
    try {
      const result = await uploadFile(file, "product");
      setImageUrl(result.public_url);
    } catch {
      setError("Failed to upload image");
      setImagePreview(null);
      setImageUrl("");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      const result = await apiDelete(`/seller/products/${productId}`);
      if (result.success) {
        router.push("/seller/products");
      } else {
        setError(result.error || "Failed to delete product");
      }
    } catch {
      setError("Network error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const result = await apiPut(`/seller/products/${productId}`, {
        title,
        description,
        price_paise: Math.round(parseFloat(price) * 100),
        category_id: category || undefined,
        github_repo_url: githubUrl || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        image_url: imageUrl || undefined,
        status,
      });

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

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Form (3 cols) */}
        <div className="lg:col-span-3">
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
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Image</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Product preview" className="w-full h-48 object-cover rounded-lg border border-slate-200" />
                      <button type="button" onClick={handleRemoveImage}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Click to upload image</span>
                      <span className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB</span>
                    </button>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className="h-11 border-slate-300 bg-white" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={5000}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400" />
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (INR)</label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="49" required className="h-11 border-slate-300 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400">
                      <option value="">Select category</option>
                      {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                {/* GitHub URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">GitHub Repository URL</label>
                  <div className="relative">
                    <GithubIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username/repo"
                      className="h-11 border-slate-300 bg-white pl-10" />
                  </div>
                </div>

                {/* Tags + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags</label>
                    <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, Next.js, TypeScript"
                      maxLength={500} className="h-11 border-slate-300 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm">
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-4">
                  <Button type="submit" disabled={saving || uploading} className="bg-slate-950 text-white hover:bg-slate-800">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                  <Link href="/seller/products">
                    <Button type="button" variant="outline" className="border-slate-300 text-slate-700">Cancel</Button>
                  </Link>
                  <div className="flex-1" />
                  <Button type="button" variant="outline" disabled={deleting} onClick={handleDelete}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Delete
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Preview (2 cols) */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Preview</span>
            </div>

            <Card className="border-slate-200 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="Product preview" className="w-full h-full object-cover" />
                ) : (
                  <GithubIcon className="w-10 h-10 text-slate-400" />
                )}
                {category && (
                  <Badge variant="secondary" className="absolute top-3 left-3 text-[10px] px-2 py-0.5 bg-white/90 border border-slate-200">
                    {category}
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-950 text-sm leading-snug line-clamp-2">
                  {title || "Product Title"}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {description || "Product description will appear here..."}
                </p>

                {tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.split(",").filter(t => t.trim()).slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{tag.trim()}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-3">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium text-slate-700">0.0</span>
                  <span className="text-xs text-slate-400">(0)</span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-base font-bold text-slate-950">
                    {price && !isNaN(parseFloat(price)) && parseFloat(price) >= 49
                      ? `INR ${parseFloat(price).toLocaleString()}`
                      : "INR 0"}
                  </span>
                  <Badge variant="secondary" className={`text-[10px] ${
                    status === "active" ? "bg-emerald-100 text-emerald-700" :
                    status === "paused" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>{status}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
