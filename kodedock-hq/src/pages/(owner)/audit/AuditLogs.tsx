import { useState, useEffect } from "react";
import { 
  Activity, ShieldAlert, FileEdit, Settings, UserCog, LogIn, Search, Filter 
} from "lucide-react";

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

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/hq/audit-logs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("hq_token")}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setLogs(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN")) return <LogIn className="w-4 h-4 text-blue-500" />;
    if (action.includes("UPDATE") || action.includes("EDIT")) return <FileEdit className="w-4 h-4 text-orange-500" />;
    if (action.includes("DELETE") || action.includes("SUSPEND")) return <ShieldAlert className="w-4 h-4 text-red-500" />;
    if (action.includes("STAFF") || action.includes("ROLE")) return <UserCog className="w-4 h-4 text-purple-500" />;
    if (action.includes("SETTING")) return <Settings className="w-4 h-4 text-gray-500" />;
    return <Activity className="w-4 h-4 text-green-500" />;
  };

  const filteredLogs = logs.filter(l => 
    (l.action?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (l.staff_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-muted-foreground mt-1">
          Track and review all administrative actions taken on the platform.
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search by action or staff name..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-md text-sm font-medium hover:bg-secondary transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-6 py-3 font-medium">Action & Time</th>
              <th className="px-6 py-3 font-medium">Staff Member</th>
              <th className="px-6 py-3 font-medium">Target / Reason</th>
              <th className="px-6 py-3 font-medium">Changes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  Loading audit logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-md">
                        {getActionIcon(log.action)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).replace(/,/g, "")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-foreground">
                      {log.staff_name || "System"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {log.target_resource_id && (
                        <p className="text-xs font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded w-fit">
                          {log.target_resource_id}
                        </p>
                      )}
                      {log.reason && (
                        <p className="text-sm text-muted-foreground">{log.reason}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(log.old_data || log.new_data) ? (
                      <button className="text-xs font-medium text-primary hover:underline">
                        View Diff
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
