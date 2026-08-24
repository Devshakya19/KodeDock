import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Users, ShoppingBag, CreditCard, Shield, LifeBuoy, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HqLayout() {
  const { isAuthenticated, logout, staff } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin and Owner are the same for now, so they get full access to all modules.
  const links = [
    { name: "Marketplace", path: "/owner/marketplace", icon: ShoppingBag },
    { name: "Users & Sellers", path: "/owner/users", icon: Users },
    { name: "Finance", path: "/owner/finance", icon: CreditCard },
    { name: "Trust & Safety", path: "/owner/safety", icon: Shield },
    { name: "Support", path: "/owner/support", icon: LifeBuoy },
    { name: "HQ Settings", path: "/owner/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="w-full md:w-64 bg-card border-r border-border p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2 mt-2">
            <img src="/icons/logo/kd.svg" alt="Logo" className="h-8 w-8" />
            <h1 className="font-bold text-xl tracking-tight text-foreground">KodeDock HQ</h1>
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
              {staff?.name?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{staff?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{staff?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
