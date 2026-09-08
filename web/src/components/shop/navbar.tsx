"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, User } from "@/shared/lib/auth/client";
import { LogOut, ShoppingCart, User as UserIcon, Code, UploadCloud, LayoutDashboard } from "lucide-react";

export default function ShopNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const u = await auth.getUser();
      setUser(u);
    }
    loadUser();
  }, [pathname]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const isDeveloper = user?.role === "developer" || user?.role === "admin";

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-md border-b border-white/10 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/explore" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Code className="text-purple-500" /> KodeDock
        </Link>
        <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
          <Link href="/explore" className={`hover:text-white transition-colors ${pathname.startsWith("/explore") ? "text-white font-medium" : ""}`}>Explore</Link>
          <Link href="/explore?cat=all" className={`hover:text-white transition-colors ${pathname === "/categories" ? "text-white font-medium" : ""}`}>Categories</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {isDeveloper ? (
              <>
                <Link href="/seller/dashboard" className="text-gray-300 hover:text-white hidden sm:flex items-center gap-2">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link href="/seller/upload" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                  <UploadCloud size={16} /> Upload
                </Link>
              </>
            ) : (
              <Link href="/cart" className="text-gray-300 hover:text-white flex items-center gap-2 relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-1.5 -right-2 bg-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">0</span>
              </Link>
            )}

            <div className="h-6 w-[1px] bg-white/20 mx-2"></div>

            <Link href="/profile" className="text-gray-300 hover:text-white flex items-center gap-2">
              <UserIcon size={18} />
              <span className="hidden sm:inline text-sm">{user.github_username || user.full_name || "Profile"}</span>
            </Link>

            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors ml-2">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="text-sm font-medium bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
