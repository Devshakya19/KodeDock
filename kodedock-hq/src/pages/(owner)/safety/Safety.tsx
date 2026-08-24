import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Search, MoreHorizontal, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Dispute {
  id: string;
  order_id: string;
  raised_by_name: string | null;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  created_at: string | null;
}

export default function Safety() {
  const { token } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

  const fetchDisputes = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/hq/safety/disputes?limit=20", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setDisputes(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch disputes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDisputes();
  }, [token]);

  const updateDisputeStatus = async (id: string, status: string) => {
    try {
      const resolution = status === 'resolved' ? 'Resolved by HQ Admin' : 
                         status === 'closed' ? 'Closed without action' : null;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/hq/safety/disputes/${id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status, resolution })
      });
      if (res.ok) {
        setDisputes(disputes.map(d => d.id === id ? { ...d, status, resolution } : d));
        setActiveDropdown(null);
      }
    } catch (err) {
      console.error("Failed to update dispute", err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-rose-500" />
            Trust & Safety
          </h1>
          <p className="text-muted-foreground mt-1">Manage order disputes, reports, and platform integrity.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search disputes..." 
              className="w-full md:w-64 bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-visible">
        <div className="overflow-x-visible">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Dispute Details</th>
                <th className="px-6 py-4">Raised By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Resolution</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    Loading disputes...
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No active disputes! The platform is safe.
                  </td>
                </tr>
              ) : (
                disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{d.reason}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-[250px] truncate">
                        Order ID: {d.order_id}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-foreground">{d.raised_by_name || "Unknown"}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1",
                        d.status === 'open' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                        d.status === 'under_review' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        d.status === 'resolved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        "bg-secondary text-muted-foreground border-border"
                      )}>
                        {d.status === 'open' && <AlertTriangle className="h-3 w-3" />}
                        {d.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {d.resolution || "Pending Review"}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === d.id ? null : d.id)}
                        className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {/* Custom Dropdown Menu */}
                      {activeDropdown === d.id && (
                        <div 
                          ref={dropdownRef} 
                          className="absolute right-6 top-10 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-border mb-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Resolve Dispute</p>
                          </div>
                          {d.status === 'open' && (
                            <button 
                              onClick={() => updateDisputeStatus(d.id, 'under_review')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                            >
                              <AlertTriangle className="h-4 w-4" /> Mark Under Review
                            </button>
                          )}
                          <button 
                            onClick={() => updateDisputeStatus(d.id, 'resolved')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" /> Resolve (Refund Buyer)
                          </button>
                          <button 
                            onClick={() => updateDisputeStatus(d.id, 'closed')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary hover:text-foreground transition-colors"
                          >
                            <XCircle className="h-4 w-4" /> Close (Reject Claim)
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
