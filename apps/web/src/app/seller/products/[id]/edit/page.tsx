"use client";
import { GithubIcon } from "@/shared/components/github-icon";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  Star,
  X,
  Eye,
  Trash2,
  Tag,
  Package,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { apiGet, apiPut, apiDelete } from "@/shared/lib/api";
import { uploadFile } from "@/shared/lib/upload";

const CATEGORIES = [
  "Web Templates", "Mobile Apps", "UI Kits", "B.Tech Projects",
  "Boilerplates", "API Templates",
];

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
  const [isFree, setIsFree] = useState(false);
  const [stockLimit, setStockLimit] = useState("");
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
          if (p.price_paise === 0) {
            setIsFree(true);
            setPrice("0");
          } else {
            setIsFree(false);
            setPrice(p.price_paise ? (p.price_paise / 100).toString() : "");
          }
          setCategory(p.category_name || "");
          setGithubUrl(p.github_repo_url || "");
          setTags(p.tags?.join(", ") || "");
          setImageUrl(p.image_url || "");
          setImagePreview(p.image_url || null);
          setStatus(p.status || "active");
          setStockLimit(p.stock_limit !== null && p.stock_limit !== undefined ? p.stock_limit.toString() : "");
        }
      } catch {}
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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

    let pricePaise = 0;
    if (!isFree) {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue < 49) {
        setError("Price must be at least ₹49");
        setSaving(false);
        return;
      }
      pricePaise = Math.round(priceValue * 100);
    }

    let stockLimitValue: number | undefined;
    if (status === "limited" && stockLimit) {
      const stockLimitNum = parseInt(stockLimit);
      if (isNaN(stockLimitNum) || stockLimitNum <= 0) {
        setError("Stock limit must be a positive number");
        setSaving(false);
        return;
      }
      stockLimitValue = stockLimitNum;
    }

    try {
      const result = await apiPut(`/seller/products/${productId}`, {
        title,
        description,
        price_paise: pricePaise,
        category_id: category || undefined,
        github_repo_url: githubUrl || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        image_url: imageUrl || undefined,
        status,
        stock_limit: stockLimitValue,
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100/50">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Product Updated!</h2>
          <p className="text-slate-500 text-[15px]">Your changes have been saved successfully. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors mb-5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to products
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Edit Product
          </h1>
          <p className="text-slate-500 mt-2 text-[15px]">
            Make changes to your product listing.
          </p>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          disabled={deleting} 
          onClick={handleDelete}
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
          Delete Product
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-10">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-3 animate-in fade-in">
              <X className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* 1. Basic Info Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-bold">1</div>
                <h2 className="text-lg font-bold text-slate-900">Basic Details</h2>
              </div>

              <div className="space-y-5">
                {/* Title */}
                <div className="group">
                  <label htmlFor="title" className="block text-[13px] font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-slate-900">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                    className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  />
                </div>

                {/* Description */}
                <div className="group">
                  <label htmlFor="description" className="block text-[13px] font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-slate-900">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    maxLength={5000}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-y"
                  />
                </div>

                {/* Category & Tags Grid */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="group">
                    <label htmlFor="category" className="block text-[13px] font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-slate-900">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full h-12 appearance-none bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-10 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
                      >
                        <option value="" disabled>Select category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="tags" className="block text-[13px] font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-slate-900">
                      Tags
                    </label>
                    <div className="relative">
                      <input
                        id="tags"
                        placeholder="React, SaaS, UI..."
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        maxLength={500}
                        className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                      />
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Media Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-bold">2</div>
                <h2 className="text-lg font-bold text-slate-900">Media & Assets</h2>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-3">
                  Cover Image <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative group/img rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-auto max-h-[400px] object-contain transition-transform duration-700 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover/img:bg-slate-900/10 transition-colors duration-300" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-slate-700 flex items-center justify-center hover:bg-white hover:text-red-600 shadow-sm border border-slate-200/50 transition-all transform hover:scale-105"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex flex-col items-center justify-center w-full aspect-[16/9] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                      <div className="text-center">
                        <span className="text-[14px] font-medium text-slate-700">Click to upload cover image</span>
                        <p className="text-[12px] text-slate-400 mt-1">16:9 ratio recommended. Max 5MB (JPG/PNG)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GitHub URL */}
              <div className="group">
                <label htmlFor="githubUrl" className="block text-[13px] font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-slate-900">
                  GitHub Repository (Optional)
                </label>
                <div className="relative">
                  <GithubIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="githubUrl"
                    placeholder="https://github.com/username/repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  />
                </div>
                <p className="text-[12px] text-slate-500 mt-2">
                  Link your private repository to automatically invite buyers upon purchase.
                </p>
              </div>
            </section>

            {/* 3. Pricing & Delivery */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-bold">3</div>
                <h2 className="text-lg font-bold text-slate-900">Pricing & Delivery</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Pricing Type Toggle */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                    Pricing Model
                  </label>
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 relative">
                    <div
                      className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] bg-white rounded-lg shadow-sm border border-slate-200 transition-transform duration-300 ease-in-out ${
                        isFree ? "translate-x-full" : "translate-x-0"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => { setIsFree(false); if (price === "0") setPrice(""); }}
                      className={`relative z-10 h-10 text-[13px] font-semibold rounded-lg transition-colors ${
                        !isFree ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsFree(true); setPrice("0"); }}
                      className={`relative z-10 h-10 text-[13px] font-semibold rounded-lg transition-colors ${
                        isFree ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Free
                    </button>
                  </div>
                </div>

                {/* Price Input */}
                <div className={`group transition-opacity duration-300 ${isFree ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                  <label htmlFor="price" className="block text-[13px] font-semibold text-slate-700 mb-2 group-focus-within:text-slate-900">
                    Price (INR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="price"
                      type="number"
                      placeholder={isFree ? "0" : "499"}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min={isFree ? "0" : "49"}
                      className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                      disabled={isFree}
                    />
                  </div>
                  {!isFree && (
                    <p className="text-[11px] font-medium text-slate-500 mt-2">
                      Min. ₹49. Platform fee is 2.5%. You earn: <span className="text-emerald-600 font-bold">₹{price && parseFloat(price) >= 49 ? (parseFloat(price) * 0.975).toFixed(2) : "0"}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Status and Stock Limit */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="group">
                  <label htmlFor="status" className="block text-[13px] font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-slate-900">
                    Product Status
                  </label>
                  <div className="relative">
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-12 appearance-none bg-slate-50/50 border border-slate-200 rounded-xl pl-4 pr-10 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
                    >
                      <option value="active">Active (Available for all)</option>
                      <option value="limited">Limited Edition</option>
                      <option value="paused">Paused</option>
                      <option value="draft">Draft</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {status === "limited" && (
                  <div className="group animate-in fade-in slide-in-from-top-1">
                    <label htmlFor="stockLimit" className="block text-[13px] font-semibold text-slate-700 mb-2 group-focus-within:text-slate-900">
                      Stock Limit <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="stockLimit"
                      type="number"
                      placeholder="e.g. 50"
                      value={stockLimit}
                      onChange={(e) => setStockLimit(e.target.value)}
                      min="1"
                      className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Action Area */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[12px] text-slate-500 text-center sm:text-left">
                Ensure all details are correct before saving changes.
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <Link href="/seller/products" className="flex-1 sm:flex-none">
                  <Button type="button" variant="outline" className="w-full border-slate-200 text-slate-700 bg-white h-12 rounded-xl">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 sm:flex-none h-12 px-8 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {saving || uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {uploading ? "Uploading image..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Live Preview Card */}
        <div className="lg:col-span-5 hidden lg:block relative">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Card Preview</span>
            </div>
            
            {/* The Marketplace Card Replica */}
            <div className="group relative bg-white rounded-[24px] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-50 flex items-center justify-center relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-slate-200" />
                  </div>
                )}
                {/* Category Badge */}
                {category && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/95 backdrop-blur-md text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-slate-200/50">
                      {category}
                    </span>
                  </div>
                )}
                
                {/* Status Badge overlay */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border ${
                    status === "active" ? "bg-emerald-500/90 text-white border-emerald-400/50" :
                    status === "limited" ? "bg-rose-500/90 text-white border-rose-400/50" :
                    status === "paused" ? "bg-amber-500/90 text-white border-amber-400/50" :
                    "bg-slate-800/90 text-white border-slate-700/50"
                  }`}>
                    {status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-[13px] font-bold text-slate-700">0.0</span>
                    <span className="text-[12px] text-slate-400">(0)</span>
                  </div>
                  {status === "limited" && stockLimit && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      Only {stockLimit} left
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-[18px] leading-tight mb-1.5 line-clamp-2">
                  {title || "Your Product Title"}
                </h3>
                <p className="text-[13px] text-slate-500 line-clamp-2 mb-4 min-h-[40px]">
                  {description || "A short, catchy description of what makes your product great..."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-[20px] font-extrabold ${isFree ? "text-emerald-600" : "text-slate-900"}`}>
                      {isFree ? "Free" : (price && !isNaN(parseFloat(price)) && parseFloat(price) >= 49 ? `₹${parseFloat(price).toLocaleString()}` : "₹0")}
                    </span>
                  </div>
                  <span className="text-[12px] font-medium text-slate-400">by You</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
               <p className="text-[13px] text-slate-400 flex items-center justify-center gap-1.5">
                 Changes appear instantly after saving
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
