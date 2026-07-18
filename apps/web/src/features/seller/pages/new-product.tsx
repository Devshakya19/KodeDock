"use client";
import { GithubIcon } from "@/shared/components/github-icon";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Upload,
  Star,
  X,
  Eye,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { apiPost } from "@/shared/lib/api";
import { uploadFile } from "@/shared/lib/upload";

const CATEGORIES = [
  "Web Templates",
  "Mobile Apps",
  "UI Kits",
  "B.Tech Projects",
  "Boilerplates",
  "API Templates",
];

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    // Revoke previous preview URL to prevent memory leak
    if (imagePreview) {
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
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const pricePaise = Math.round(parseFloat(price) * 100);
    if (isNaN(pricePaise) || pricePaise < 4900) {
      setError("Price must be at least ₹49");
      setLoading(false);
      return;
    }

    try {
      const result = await apiPost("/seller/products", {
        title,
        description,
        price_paise: pricePaise,
        category_id: category || undefined,
        github_repo_url: githubUrl || undefined,
        image_url: imageUrl || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/seller/products"), 2000);
      } else {
        setError(result.error || "Failed to create product");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950 mb-2">Product Created!</h2>
            <p className="text-slate-600">Your product has been listed. Redirecting to products...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/seller/products"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
        <h1 className="text-2xl font-bold text-slate-950">List New Product</h1>
        <p className="text-slate-600 mt-1">Add your code asset to the marketplace</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="border-slate-200">
            <CardContent className="p-8">
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Product Image
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Click to upload image</span>
                      <span className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB</span>
                    </button>
                  )}
                </div>

                {/* Product Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Product title
                  </label>
                  <Input
                    id="title"
                    placeholder="e.g. Next.js SaaS Starter Kit"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                    className="h-11 border-slate-300 bg-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Describe what's included, key features, tech stack..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    maxLength={5000}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                  />
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Price (INR)
                    </label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="499"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min="49"
                      className="h-11 border-slate-300 bg-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimum INR 49. You keep 97.5%.</p>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Category
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* GitHub URL */}
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-slate-700 mb-1.5">
                    GitHub Repository URL
                  </label>
                  <div className="relative">
                    <GithubIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/username/repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      required
                      className="h-11 border-slate-300 bg-white pl-10"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Buyers will get access to a private fork of this repo.
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tags
                  </label>
                  <Input
                    id="tags"
                    placeholder="React, Next.js, TypeScript (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    maxLength={500}
                    className="h-11 border-slate-300 bg-white"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="bg-slate-950 text-white hover:bg-slate-800"
                  >
                    {loading || uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {uploading ? "Uploading image..." : "List Product"}
                  </Button>
                  <Link href="/seller/products">
                    <Button type="button" variant="outline" className="border-slate-300 text-slate-700">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Live Preview</span>
              <Badge variant="secondary" className="text-[10px] bg-slate-100 border-slate-200">
                How buyers see it
              </Badge>
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
                {price && parseFloat(price) >= 49 && (
                  <Badge className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-emerald-500 text-white border-0">
                    Live
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
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {tag.trim()}
                      </span>
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
                  <span className="text-[11px] text-slate-500">by You</span>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-slate-400 mt-3 text-center">
              This is how your product will appear to buyers on the marketplace.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
