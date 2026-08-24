import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Power, Archive, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  seller_id: string;
  seller_name: string | null;
  status: string;
  price_paise: number;
  sales_count: number | null;
  created_at: string | null;
}

export default function Marketplace() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:4001/api/hq/products?limit=20", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:4001/api/hq/products/${id}/status`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Update local state instantly for snappy UI
        setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
        setActiveDropdown(null);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Marketplace Hub</h1>
          <p className="text-muted-foreground mt-1">Review and manage all products on KodeDock.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full md:w-64 bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
            />
          </div>
          <button className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary/80">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-visible">
        <div className="overflow-x-visible">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-32 bg-secondary rounded mb-2"></div>
                      <div className="h-3 w-24 bg-secondary rounded"></div>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No products found in the marketplace.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">{p.id}</p>
                    </td>
                    <td className="px-6 py-4 text-foreground">{p.seller_name || "Unknown Seller"}</td>
                    <td className="px-6 py-4 text-foreground">{formatCurrency(p.price_paise)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border",
                        p.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        p.status === 'draft' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        p.status === 'paused' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        "bg-secondary text-muted-foreground border-border"
                      )}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === p.id ? null : p.id)}
                        className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {/* Custom Dropdown Menu */}
                      {activeDropdown === p.id && (
                        <div 
                          ref={dropdownRef} 
                          className="absolute right-6 top-10 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-border mb-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Change Status</p>
                          </div>
                          <button 
                            onClick={() => updateStatus(p.id, 'active')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve (Active)
                          </button>
                          <button 
                            onClick={() => updateStatus(p.id, 'paused')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                          >
                            <Clock className="h-4 w-4" /> Pause Product
                          </button>
                          <button 
                            onClick={() => updateStatus(p.id, 'archived')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          >
                            <Archive className="h-4 w-4" /> Archive (Hide)
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
