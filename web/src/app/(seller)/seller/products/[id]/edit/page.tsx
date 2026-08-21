"use client";

import { GithubIcon } from "@/shared/components/icons/github";
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
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { apiGet, apiPut, apiDelete } from "@/shared/lib/api/client";
import { uploadFile } from "@/shared/lib/api/upload";
import { SellerHeader } from "../../../components/seller-header";

const CATEGORIES = [
  "Web Templates",
  "Mobile Apps",
  "UI Kits",
  "B.Tech Projects",
  "Boilerplates",
  "API Templates",
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
          setStockLimit(
            p.stock_limit !== null && p.stock_limit !== undefined ? p.stock_limit.toString() : ""
          );
        }
      } catch {
        // Silently catch load error
      }
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
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Cover image must be less than 5MB");
      return;
    }

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
      setError("Failed to upload image. Please try again.");
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
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this product? This action cannot be reversed."
      )
    )
      return;
    setDeleting(true);
    setError("");
    try {
      const result = await apiDelete(`/seller/products/${productId}`);
      if (result.success) {
        router.push("/seller/products");
      } else {
        setError(result.error || "Failed to delete product listing");
      }
    } catch {
      setError("Network error. Please try again.");
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
        setError("Stock limit must be a positive integer");
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
        setTimeout(() => router.push("/seller/products"), 1500);
      } else {
        setError(result.error || "Failed to update product listing");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const parsedPrice = parseFloat(price);
  const sellerEarnings = !isNaN(parsedPrice) && parsedPrice >= 49 ? (parsedPrice * 0.975).toFixed(2) : "0.00";

  if (loading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Loading Product Listing...
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto text-center p-8 rounded-[32px] bg-background ring-1 ring-slate-200/80 shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2 tracking-tight">
            Product Updated!
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-normal">
            Your modifications are now saved and live in the store. Redirecting to inventory...
          </p>
          <div className="w-8 h-8 mx-auto border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {/* 1. Header */}
      <SellerHeader
        badge="Listing Editor"
        title="Edit Code Product"
        description="Update your pricing, cover asset, product metadata, and inventory availability status."
        backHref="/seller/products"
        backLabel="Back to Products"
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/products/${productId}`} target="_blank">
              <button
                type="button"
                className="h-11 px-4 rounded-xl bg-background border border-border/80 text-foreground text-xs font-bold hover:bg-secondary transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Public
              </button>
            </Link>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="h-11 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-rose-600" />}
              <span>Delete Asset</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (7 Cols): Multi-Step Form */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            <div className="rounded-[28px] bg-background p-2 ring-1 ring-slate-200/80 shadow-xs">
              <div className="rounded-[22px] bg-gradient-to-b from-background to-secondary/20 p-6 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">
                    1
                  </div>
                  <h3 className="text-base font-black text-foreground tracking-tight">
                    Basic Information
                  </h3>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-xs font-bold text-foreground mb-1.5">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                    className="w-full h-11 bg-background border border-border/80 rounded-xl px-3.5 text-sm font-medium text-foreground outline-none focus:border-primary shadow-2xs transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-xs font-bold text-foreground mb-1.5">
                    Short Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    maxLength={5000}
                    className="w-full bg-background border border-border/80 rounded-xl p-3.5 text-sm font-medium text-foreground outline-none focus:border-primary shadow-2xs transition-colors resize-y"
                  />
                </div>

                {/* Category & Tags Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-xs font-bold text-foreground mb-1.5">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full h-11 appearance-none bg-background border border-border/80 rounded-xl pl-10 pr-8 text-xs font-bold text-foreground outline-none focus:border-primary shadow-2xs cursor-pointer"
                      >
                        <option value="" disabled>
                          Select category
                        </option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-xs font-bold text-foreground mb-1.5">
                      Tags (Comma separated)
                    </label>
                    <div className="relative">
                      <input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full h-11 bg-background border border-border/80 rounded-xl pl-10 pr-3.5 text-xs font-medium text-foreground outline-none focus:border-primary shadow-2xs"
                      />
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Media & Code Repository */}
            <div className="rounded-[28px] bg-background p-2 ring-1 ring-slate-200/80 shadow-xs">
              <div className="rounded-[22px] bg-gradient-to-b from-background to-secondary/20 p-6 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">
                    2
                  </div>
                  <h3 className="text-base font-black text-foreground tracking-tight">
                    Cover Asset & GitHub Sync
                  </h3>
                </div>

                {/* Image Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Cover Image <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary flex items-center justify-center group/preview">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-auto max-h-[300px] object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-rose-600 transition-colors shadow-md cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex flex-col items-center justify-center w-full aspect-[16/8] border-2 border-dashed border-border/80 rounded-2xl bg-background hover:border-primary/50 transition-all cursor-pointer p-6 text-center shadow-2xs"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        Click to upload new thumbnail
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        16:9 or 16:10 ratio recommended (JPG, PNG, WebP up to 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* GitHub Repo */}
                <div>
                  <label htmlFor="githubUrl" className="block text-xs font-bold text-foreground mb-1.5">
                    GitHub Private Repository (Optional)
                  </label>
                  <div className="relative">
                    <GithubIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="githubUrl"
                      placeholder="https://github.com/your-username/your-repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full h-11 bg-background border border-border/80 rounded-xl pl-10 pr-3.5 text-xs font-medium text-foreground outline-none focus:border-primary shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Pricing & Availability */}
            <div className="rounded-[28px] bg-background p-2 ring-1 ring-slate-200/80 shadow-xs">
              <div className="rounded-[22px] bg-gradient-to-b from-background to-secondary/20 p-6 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">
                    3
                  </div>
                  <h3 className="text-base font-black text-foreground tracking-tight">
                    Pricing & Inventory Availability
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-5 items-start">
                  {/* Model Toggle */}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Pricing Model
                    </label>
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-secondary border border-border/80 relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFree(false);
                          if (price === "0") setPrice("");
                        }}
                        className={`h-9 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          !isFree
                            ? "bg-background text-foreground shadow-2xs font-extrabold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Paid
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFree(true);
                          setPrice("0");
                        }}
                        className={`h-9 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          isFree
                            ? "bg-background text-success shadow-2xs font-extrabold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Free Asset
                      </button>
                    </div>
                  </div>

                  {/* Price input */}
                  <div>
                    <label htmlFor="price" className="block text-xs font-bold text-foreground mb-2">
                      Price (INR) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="price"
                        type="number"
                        placeholder={isFree ? "0" : "499"}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min={isFree ? "0" : "49"}
                        disabled={isFree}
                        className="w-full h-11 bg-background border border-border/80 rounded-xl pl-9 pr-3.5 text-sm font-bold text-foreground outline-none focus:border-primary shadow-2xs disabled:opacity-40"
                      />
                    </div>
                    {!isFree && (
                      <p className="text-[11px] text-muted-foreground font-medium mt-1.5">
                        Net take-home (97.5%):{" "}
                        <span className="font-bold text-success">₹{sellerEarnings}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Status selector */}
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label htmlFor="status" className="block text-xs font-bold text-foreground mb-1.5">
                      Catalog Status
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-11 bg-background border border-border/80 rounded-xl px-3.5 text-xs font-bold text-foreground outline-none focus:border-primary shadow-2xs cursor-pointer"
                    >
                      <option value="active">Active (Available to all)</option>
                      <option value="limited">Limited Edition (Capped Units)</option>
                      <option value="paused">Paused</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {status === "limited" && (
                    <div>
                      <label htmlFor="stockLimit" className="block text-xs font-bold text-foreground mb-1.5">
                        Stock Limit (Available Copies) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="stockLimit"
                        type="number"
                        placeholder="e.g. 25"
                        value={stockLimit}
                        onChange={(e) => setStockLimit(e.target.value)}
                        min="1"
                        className="w-full h-11 bg-background border border-border/80 rounded-xl px-3.5 text-xs font-bold text-foreground outline-none focus:border-primary shadow-2xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Deck */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <Link href="/seller/products" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto h-12 px-6 rounded-xl bg-background border border-border/80 text-xs font-bold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </Link>

              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-950/20 active:scale-[0.98] cursor-pointer"
              >
                {saving || uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{uploading ? "Uploading Image..." : "Save Product Changes"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (5 Cols): Sticky Marketplace Card Replica Preview */}
        <div className="lg:col-span-5 hidden lg:block sticky top-24">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
              Live Buyer Preview
            </span>
          </div>

          <div className="rounded-[28px] bg-background p-2 ring-1 ring-slate-200/80 shadow-lg">
            <div className="rounded-[22px] bg-gradient-to-b from-background to-secondary/30 overflow-hidden flex flex-col">
              <div className="aspect-[16/10] w-full bg-secondary flex items-center justify-center relative overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground/80" />
                )}

                {category && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-secondary text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                      {category}
                    </span>
                  </div>
                )}

                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs border ${
                      status === "active"
                        ? "bg-emerald-500/90 text-primary-foreground border-emerald-400/50"
                        : status === "limited"
                        ? "bg-rose-500/90 text-primary-foreground border-rose-400/50"
                        : status === "paused"
                        ? "bg-amber-500/90 text-primary-foreground border-amber-400/50"
                        : "bg-secondary text-foreground border-border"
                    }`}
                  >
                    {status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-foreground ml-1">5.0</span>
                  </div>
                  {status === "limited" && stockLimit && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      {stockLimit} copies left
                    </span>
                  )}
                </div>

                <h3 className="font-black text-foreground text-base leading-snug mb-2 line-clamp-2">
                  {title || "Your Code Product Title"}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed font-normal">
                  {description || "A concise summary of your boilerplate code, components, and design assets..."}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="font-black text-foreground text-lg tabular-nums">
                    {isFree ? (
                      <span className="text-success">Free</span>
                    ) : parsedPrice && !isNaN(parsedPrice) && parsedPrice >= 49 ? (
                      `₹${parsedPrice.toLocaleString()}`
                    ) : (
                      "₹0"
                    )}
                  </div>
                  <span className="text-xs font-bold text-accent">View Details ↗</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
