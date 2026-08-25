import { useState } from "react";
import { 
  Activity, ShieldAlert, FileEdit, Settings, UserCog, LogIn, Search
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type AuditLog = {
  id: string;
  staff_name: string | null;
  action: string;
  target_resource_id: string | null;
  reason: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
};

const getActionIcon = (action: string) => {
  if (action.includes("LOGIN")) return <LogIn className="w-4 h-4 text-blue-500" />;
  if (action.includes("UPDATE") || action.includes("EDIT")) return <FileEdit className="w-4 h-4 text-orange-500" />;
  if (action.includes("DELETE") || action.includes("SUSPEND")) return <ShieldAlert className="w-4 h-4 text-red-500" />;
  if (action.includes("STAFF") || action.includes("ROLE")) return <UserCog className="w-4 h-4 text-purple-500" />;
  if (action.includes("SETTING")) return <Settings className="w-4 h-4 text-gray-500" />;
  return <Activity className="w-4 h-4 text-emerald-500" />;
};

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "action",
    header: "Action & Time",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-secondary rounded-md">
          {getActionIcon(row.original.action)}
        </div>
        <div>
          <p className="font-medium text-foreground">{row.original.action}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(row.original.created_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).replace(/,/g, "")}
          </p>
        </div>
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const val = row.getValue<string>(columnId)?.toLowerCase() || "";
      const staff = row.original.staff_name?.toLowerCase() || "";
      const search = filterValue.toLowerCase();
      return val.includes(search) || staff.includes(search);
    }
  },
  {
    accessorKey: "staff_name",
    header: "Staff Member",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-foreground border border-border">
        {row.original.staff_name || "System"}
      </span>
    ),
  },
  {
    id: "target",
    header: "Target / Reason",
    cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.target_resource_id && (
          <p className="text-xs font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded w-fit border border-border/50">
            {row.original.target_resource_id}
          </p>
        )}
        {row.original.reason && (
          <p className="text-sm text-muted-foreground">{row.original.reason}</p>
        )}
      </div>
    ),
  },
  {
    id: "changes",
    header: "Changes",
    cell: ({ row }) => (
      (row.original.old_data || row.original.new_data) ? (
        <button className="text-xs font-medium text-primary hover:underline px-2 py-1 rounded hover:bg-primary/10 transition-colors">
          View Diff
        </button>
      ) : (
        <span className="text-xs text-muted-foreground pl-2">-</span>
      )
    ),
  }
];

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ['hq-audit-logs'],
    queryFn: async () => await api.get("/api/hq/audit-logs")
  });

  const logs: AuditLog[] = response?.data || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Audit Logs</h2>
        <p className="text-muted-foreground mt-1 font-medium">
          Track and review all administrative actions taken on the platform.
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search by action or staff name..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading audit logs...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={logs.filter(l => 
              (l.action?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
              (l.staff_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
            )} 
          />
        )}
      </div>
    </div>
  );
}
