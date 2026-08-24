import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Filter, MoreHorizontal, UserX, UserCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string | null;
}

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
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

  const fetchUsers = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/hq/users?limit=20", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const updateUserStatus = async (id: string, is_active: boolean) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/hq/users/${id}/status`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_active })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, is_active } : u));
        setActiveDropdown(null);
      }
    } catch (err) {
      console.error("Failed to update user status", err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Monitor, suspend, and manage buyers and sellers.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by email..." 
              className="w-full md:w-64 bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
            />
          </div>
          <button className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary/80">
            <Filter className="h-4 w-4" />
            Role Filter
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-visible">
        <div className="overflow-x-visible">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Account Status</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No users found in the database.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{u.full_name || "No Name"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border",
                        u.role === 'developer' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                        "bg-secondary text-muted-foreground border-border"
                      )}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_verified ? (
                        <span className="text-emerald-500 text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs font-medium">Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1 w-max">
                          <ShieldAlert className="h-3 w-3" /> SUSPENDED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)}
                        className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {/* Custom Dropdown Menu */}
                      {activeDropdown === u.id && (
                        <div 
                          ref={dropdownRef} 
                          className="absolute right-6 top-10 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-border mb-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Safety Actions</p>
                          </div>
                          {u.is_active ? (
                            <button 
                              onClick={() => updateUserStatus(u.id, false)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            >
                              <UserX className="h-4 w-4" /> Suspend Account
                            </button>
                          ) : (
                            <button 
                              onClick={() => updateUserStatus(u.id, true)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                            >
                              <UserCheck className="h-4 w-4" /> Restore Account
                            </button>
                          )}
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
