import { getServerUser } from "@/shared/lib/auth/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

export default async function WishlistPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // Since wishlist isn't fully implemented in the backend yet, show a premium empty state
  const wishlistItems: any[] = [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">My Wishlist</h1>
            <p className="text-muted-foreground mt-2 text-base font-medium">Keep track of the products you love and plan to buy.</p>
          </div>
        </div>
      </div>

      {!wishlistItems || wishlistItems.length === 0 ? (
        <div className="bg-background rounded-[24px] border border-border/60 shadow-sm p-16 text-center">
          <div className="w-20 h-20 rounded-[20px] bg-rose-50 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">Your wishlist is empty</h3>
          <p className="text-muted-foreground text-base max-w-md mx-auto mb-8 font-medium">
            You haven't saved any products yet. Click the heart icon on any product to save it for later.
          </p>
          <Link href="/browse" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-lg shadow-foreground/10 hover:-translate-y-0.5">
            Discover Products
          </Link>
        </div>
      ) : (
        <div>
           {/* Render wishlist grid here in the future */}
        </div>
      )}
    </div>
  );
}
