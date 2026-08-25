import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, MoreHorizontal, UserX, UserCheck, ShieldAlert, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string | null;
}

// Reusable Dropdown Cell Component
const ActionCell = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mutation = useMutation({
    mutationFn: async (is_active: boolean) => {
      await api.put(`/api/hq/users/${user.id}/status`, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hq-users'] });
      setIsOpen(false);
    },
    onError: (err) => {
      console.error("Failed to update user status", err);
    }
  });

  return (
    <div className="relative text-right" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-6 top-0 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 overflow-hidden text-left">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Safety Actions</p>
          </div>
          {user.is_active ? (
            <button 
              onClick={() => mutation.mutate(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <UserX className="h-4 w-4" /> Suspend Account
            </button>
          ) : (
            <button 
              onClick={() => mutation.mutate(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
            >
              <UserCheck className="h-4 w-4" /> Restore Account
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Define DataTable Columns
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email", // Use email as searchKey since full_name can be null
    header: "User Details",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.full_name || "No Name"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium border",
          role === 'developer' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
          "bg-secondary text-muted-foreground border-border"
        )}>
          {role.toUpperCase()}
        </span>
      );
    }
  },
  {
    accessorKey: "is_verified",
    header: "Verification",
    cell: ({ row }) => (
      row.original.is_verified ? (
        <span className="text-emerald-500 text-xs font-medium flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" /> Verified
        </span>
      ) : (
        <span className="text-muted-foreground text-xs font-medium">Unverified</span>
      )
    ),
  },
  {
    accessorKey: "is_active",
    header: "Account Status",
    cell: ({ row }) => (
      row.original.is_active ? (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          ACTIVE
        </span>
      ) : (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1 w-max">
          <ShieldAlert className="h-3 w-3" /> SUSPENDED
        </span>
      )
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <ActionCell user={row.original} />,
  }
];

export default function Users() {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['hq-users'],
    queryFn: async () => {
      const data = await api.get('/api/hq/users?limit=100');
      return data;
    }
  });

  const users = response?.data || [];
  const total = users.length;
  const sellers = users.filter((u: User) => u.role === 'developer').length;
  const suspended = users.filter((u: User) => !u.is_active).length;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1 font-medium">Monitor, suspend, and manage platform participants.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-secondary text-foreground font-bold px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors shadow-sm">
            <Filter className="h-4 w-4" />
            Filter Users
          </button>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Total Users</p>
            <h3 className="text-2xl font-black text-foreground">{total}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Active Sellers</p>
            <h3 className="text-2xl font-black text-foreground">{sellers}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Suspended</p>
            <h3 className="text-2xl font-black text-foreground">{suspended}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="font-medium">Loading users...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-red-500 font-bold bg-red-500/5">Failed to load users.</div>
        ) : (
          <div className="p-2">
            <DataTable columns={columns} data={users} searchKey="email" />
          </div>
        )}
      </div>
    </div>
  );
}
