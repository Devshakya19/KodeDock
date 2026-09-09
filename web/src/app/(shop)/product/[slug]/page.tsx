"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { apiGet } from "@/shared/lib/api/client";
import {
  Loader2,
  Star,
  ShoppingCart,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  FileCode2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { GithubIcon } from "@/shared/components/icons/github";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

export interface ProductDetails {
  public_id: string;
  title: string;
  slug: string;
  description?: string;
  long_description?: string;
  price_paise: number;
  original_price_paise?: number;
  tags: string[];
  tech_stack: string[];
  demo_url?: string;
  github_repo_url?: string;
  image_url?: string;
  images?: string[]; // Array of images for gallery
  rating: number;
  review_count: number;
  sales_count: number;
  seller_username?: string;
  seller_avatar?: string;
  category_name?: string;
  updated_at?: string;
}

type TabType = "overview" | "specs" | "reviews";

const DEFAULT_PRODUCT_GALLERIES: Record<string, string[]> = {
  "veloce-radix-ui-tailwind-modern-component-kit": [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
  ],
  "dockship-nextjs-15-enterprise-saas-starter": [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  ],
  "pulsekit-flutter-ios-android-production-suite": [
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=1200&q=80",
  ],
  "kubeforge-ha-kubernetes-terraform-infrastructure": [
    "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
  ],
  "rustaxum-high-throughput-microservice": [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  ],
  "agentflow-multi-llm-orchestrator": [
    "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
  ],
};

const GENERIC_GALLERY = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
];

function getGalleryImages(product: ProductDetails): string[] {
  const images: string[] = [];
  if (product.images && product.images.length > 0) {
    images.push(...product.images);
  } else if (product.image_url) {
    images.push(product.image_url);
  }

  // Ensure every product has multiple preview photos to explore
  if (images.length < 2) {
    const curated = DEFAULT_PRODUCT_GALLERIES[product.slug] || GENERIC_GALLERY;
    for (const url of curated) {
      if (!images.includes(url)) {
        images.push(url);
      }
    }
  }

  return images;
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await apiGet<ProductDetails>(`/products/${slug}`);
        if (res.success && res.data) {
          setProduct(res.data);
          const images = getGalleryImages(res.data);
          if (images.length > 0) {
            setSelectedImage(images[0]);
          }
        } else {
          setError(res.error || "Product not found");
        }
      } catch {
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] w-full">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center px-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error || "Product not found."}</p>
          <button
            onClick={() => router.push("/explore")}
            className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  // Derive images for gallery safely
  const galleryImages = getGalleryImages(product);
  const activeImage = selectedImage || galleryImages[0] || "";
  const currentIndex = Math.max(0, galleryImages.indexOf(activeImage));

  const handlePrevImage = () => {
    if (galleryImages.length === 0) return;
    const newIndex = currentIndex <= 0 ? galleryImages.length - 1 : currentIndex - 1;
    setSelectedImage(galleryImages[newIndex]);
  };

  const handleNextImage = () => {
    if (galleryImages.length === 0) return;
    const newIndex = currentIndex >= galleryImages.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(galleryImages[newIndex]);
  };

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(paise / 100);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 pb-24">
      {/* Breadcrumb / Back Navigation: Desktop Only (Hidden on mobile) */}
      <nav className="hidden md:flex items-center text-xs font-mono text-[#A1A1AA] mb-6 gap-2">
        <Link
          href="/explore"
          className="hover:text-white transition-colors flex items-center gap-1.5 text-[#A1A1AA] hover:text-[#EDEDF0]"
        >
          <ArrowLeft size={14} />
          Explore
        </Link>
        <ChevronRight size={12} className="text-[#52525B]" />
        {product.category_name && (
          <>
            <span className="text-[#D4D4D8]">{product.category_name}</span>
            <ChevronRight size={12} className="text-[#52525B]" />
          </>
        )}
        <span className="text-[#EDEDF0] font-semibold truncate max-w-sm">
          {product.title}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Left Column: Media Gallery & Content */}
        <div className="flex-1 min-w-0 space-y-6 sm:space-y-8">
          
          {/* Multi-Image Gallery System */}
          <div className="space-y-3">
            {/* Main Preview with Navigation Controls */}
            <div className="relative aspect-[16/9] w-full bg-black/50 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#414146] shadow-2xl group">
              {activeImage ? (
                <Image 
                  src={activeImage} 
                  alt={product.title} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/10 bg-gray-900/50">
                  <FileCode2 size={64} className="opacity-20" />
                  <span className="absolute mt-24 text-sm font-medium">No Image Available</span>
                </div>
              )}

              {/* Prev / Next Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-9 sm:size-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-9 sm:size-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Photo Index Counter */}
                  <div className="absolute top-3.5 right-3.5 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white/90">
                    {currentIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
              
              {/* Overlay Gradient for premium look */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Thumbnail Strip (Always visible with multiple photos) */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 snap-x scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                      "relative h-16 sm:h-20 w-24 sm:w-32 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 snap-start group/thumb",
                      activeImage === img 
                        ? "border-[#8535FC] ring-2 ring-[#8535FC]/40 opacity-100 shadow-[0_0_15px_rgba(133,53,252,0.4)]" 
                        : "border-[#414146] opacity-60 hover:opacity-100 hover:border-white/30"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} preview ${idx + 1}`}
                      fill
                      className="object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      sizes="128px"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-xs py-0.5 px-1 text-[9px] sm:text-[10px] font-mono text-[#D4D4D8] text-center truncate">
                      Photo {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabbed Content Area */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-2 sm:p-4">
            {/* Tab Headers */}
            <div className="flex overflow-x-auto gap-2 border-b border-white/10 pb-4 px-2 sm:px-4">
              {[
                { id: "overview", label: "Overview" },
                { id: "specs", label: "Tech Specs" },
                { id: "reviews", label: `Reviews (${product.review_count})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="p-4 sm:p-6 mt-2">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="prose prose-invert prose-purple max-w-none">
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {product.long_description || product.description || "No detailed description provided for this product."}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03]">
                      <ShieldCheck className="text-green-400 shrink-0 mt-0.5" size={24} />
                      <div>
                        <h4 className="text-white font-medium">Verified Codebase</h4>
                        <p className="text-sm text-gray-400 mt-1">AST scanned for secrets & vulnerabilities.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03]">
                      <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" size={24} />
                      <div>
                        <h4 className="text-white font-medium">Instant Delivery</h4>
                        <p className="text-sm text-gray-400 mt-1">Automated GitHub repo access upon purchase.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECS TAB */}
              {activeTab === "specs" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FileCode2 size={20} className="text-purple-400" />
                      Technology Stack
                    </h3>
                    {product.tech_stack && product.tech_stack.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {product.tech_stack.map((tech) => (
                          <span key={tech} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-default">
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No tech stack specified.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Tags & Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.category_name && (
                        <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-4 py-2 rounded-xl text-sm">
                          {product.category_name}
                        </span>
                      )}
                      {product.tags && product.tags.map((tag) => (
                        <span key={tag} className="bg-gray-800 text-gray-400 px-4 py-2 rounded-xl text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === "reviews" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-6 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                    <div className="text-center">
                      <div className="text-5xl font-black text-white">{product.rating.toFixed(1)}</div>
                      <div className="flex text-yellow-500 justify-center my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < Math.round(product.rating) ? "fill-yellow-500" : "fill-gray-700 text-gray-700"} />
                        ))}
                      </div>
                      <div className="text-sm text-gray-400">{product.review_count} ratings</div>
                    </div>
                    <div className="w-px h-24 bg-white/10 hidden sm:block"></div>
                    <div className="flex-1 hidden sm:block">
                      <p className="text-gray-300">
                        Ratings and reviews are verified from actual buyers. Our escrow system ensures only true customers can leave feedback.
                      </p>
                    </div>
                  </div>
                  
                  {product.review_count === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      No reviews yet. Be the first to purchase and review!
                    </div>
                  )}
                  {/* Future: Render review list here */}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Buy Box */}
        <div className="w-full lg:w-[400px] xl:w-[440px] shrink-0">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl sticky top-24 shadow-2xl">
            {/* Title & Author */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">{product.title}</h1>
            
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-800 border border-white/20 overflow-hidden relative">
                  {product.seller_avatar ? (
                    <Image src={product.seller_avatar} alt={product.seller_username || ""} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-900/50 text-purple-200 font-bold">
                      {product.seller_username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Creator</p>
                  <p className="text-sm text-white font-medium">{product.seller_username || "Anonymous"}</p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-sm">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-white">{product.rating.toFixed(1)}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{product.sales_count} sales</div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  {product.price_paise === 0 ? "Free" : formatPrice(product.price_paise)}
                </span>
                {product.original_price_paise && product.original_price_paise > product.price_paise && (
                  <span className="text-lg text-gray-500 line-through decoration-gray-500/50">
                    {formatPrice(product.original_price_paise)}
                  </span>
                )}
              </div>
              <p className="text-sm text-green-400 mt-3 font-medium flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                One-time payment. Lifetime access.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full bg-white text-black hover:bg-gray-100 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <ShoppingCart size={20} />
                Purchase Now
              </button>

              {product.demo_url && (
                <a 
                  href={product.demo_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-white/10"
                >
                  <ExternalLink size={18} />
                  Live Preview
                </a>
              )}
            </div>

            {/* Guarantees */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <GithubIcon className="shrink-0 mt-0.5 text-gray-300" size={18} />
                <p>Instant repository invite to your linked GitHub account.</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <ShieldCheck className="shrink-0 mt-0.5 text-gray-300" size={18} />
                <p>100% secure checkout with double-entry escrow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

