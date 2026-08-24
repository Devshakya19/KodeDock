import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { LifeBuoy, Search, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string | null;
}

export default function Support() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
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

  const fetchTickets = async () => {
    try {
      const res = await fetch("http://localhost:4001/api/hq/support/tickets?limit=20", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setTickets(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch support tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTickets();
  }, [token]);

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:4001/api/hq/support/tickets/${id}/status`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
        setActiveDropdown(null);
      }
    } catch (err) {
      console.error("Failed to update ticket", err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LifeBuoy className="h-8 w-8 text-sky-500" />
            Support Inbox
          </h1>
          <p className="text-muted-foreground mt-1">Manage and resolve user queries and issues.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
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
                <th className="px-6 py-4">Subject & Message</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    Loading tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    Inbox zero! No active support tickets.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground max-w-[250px] truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-[250px] truncate">
                        {t.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{t.user_name || "No Name"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.user_email || "No Email"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                        t.priority === 'urgent' ? "bg-rose-500 text-white" :
                        t.priority === 'high' ? "bg-orange-500/20 text-orange-500" :
                        t.priority === 'low' ? "bg-slate-500/20 text-slate-500" :
                        "bg-blue-500/20 text-blue-500"
                      )}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1",
                        t.status === 'open' ? "bg-sky-500/10 text-sky-500 border-sky-500/20" :
                        t.status === 'in_progress' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        t.status === 'resolved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        "bg-secondary text-muted-foreground border-border"
                      )}>
                        {t.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === t.id ? null : t.id)}
                        className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {/* Custom Dropdown Menu */}
                      {activeDropdown === t.id && (
                        <div 
                          ref={dropdownRef} 
                          className="absolute right-6 top-10 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-border mb-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Update Ticket</p>
                          </div>
                          {t.status === 'open' && (
                            <button 
                              onClick={() => updateTicketStatus(t.id, 'in_progress')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                            >
                              <Clock className="h-4 w-4" /> In Progress
                            </button>
                          )}
                          <button 
                            onClick={() => updateTicketStatus(t.id, 'resolved')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" /> Mark Resolved
                          </button>
                          <button 
                            onClick={() => updateTicketStatus(t.id, 'closed')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary hover:text-foreground transition-colors"
                          >
                            <XCircle className="h-4 w-4" /> Close Ticket
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
