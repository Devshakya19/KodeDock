import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

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

const DisputeActionCell = ({ dispute }: { dispute: Dispute }) => {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ status, resolution }: { status: string, resolution: string }) => {
      setProcessing(true);
      await api.put(`/api/hq/safety/disputes/${dispute.id}`, { status, resolution });
    },
    onSuccess: () => {
      toast.success("Dispute status updated");
      queryClient.invalidateQueries({ queryKey: ['hq-safety-disputes'] });
    },
    onError: () => {
      toast.error("Failed to update dispute status");
    },
    onSettled: () => setProcessing(false)
  });

  if (dispute.status !== 'open' && dispute.status !== 'under_review') {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  return (
    <div className="flex justify-end gap-2">
      {dispute.status === 'open' && (
        <button 
          onClick={() => mutation.mutate({ status: 'under_review', resolution: 'Investigation started' })}
          disabled={processing}
          className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded hover:bg-amber-500/20 text-xs font-medium transition-colors disabled:opacity-50"
        >
          Review
        </button>
      )}
      <button 
        onClick={() => { if(confirm('Resolve and refund?')) mutation.mutate({ status: 'resolved', resolution: 'Resolved by HQ Admin' }) }}
        disabled={processing}
        className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20 text-xs font-medium transition-colors disabled:opacity-50"
      >
        Resolve
      </button>
      <button 
        onClick={() => { if(confirm('Reject and close claim?')) mutation.mutate({ status: 'closed', resolution: 'Closed without action' }) }}
        disabled={processing}
        className="px-2.5 py-1 bg-secondary text-foreground rounded hover:bg-secondary/80 text-xs font-medium transition-colors disabled:opacity-50"
      >
        Close
      </button>
    </div>
  );
};

const columns: ColumnDef<Dispute>[] = [
  {
    accessorKey: "reason",
    header: "Dispute Details",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.reason}</p>
        <p className="text-xs text-muted-foreground mt-0.5 max-w-[250px] truncate">
          Order ID: <span className="font-mono">{row.original.order_id}</span>
        </p>
      </div>
    ),
  },
  {
    accessorKey: "raised_by_name",
    header: "Raised By",
    cell: ({ row }) => <span className="text-foreground">{row.original.raised_by_name || "Unknown"}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border inline-flex items-center gap-1",
          status === 'open' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
          status === 'under_review' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          status === 'resolved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
          "bg-secondary text-muted-foreground border-border"
        )}>
          {status === 'open' && <AlertTriangle className="h-3 w-3" />}
          {status.replace('_', ' ')}
        </span>
      );
    },
  },
  {
    accessorKey: "resolution",
    header: "Resolution",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {row.original.resolution || "Pending Review"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <DisputeActionCell dispute={row.original} />,
  }
];

export default function Safety() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['hq-safety-disputes'],
    queryFn: async () => await api.get("/api/hq/safety/disputes?limit=100")
  });

  const disputes: Dispute[] = response?.data || [];
  
  const total = disputes.length;
  const open = disputes.filter(d => d.status === 'open').length;
  const resolved = disputes.filter(d => d.status === 'resolved').length;

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-rose-500" />
            Trust & Safety
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage order disputes, reports, and platform integrity.</p>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Action Required</p>
            <h3 className="text-2xl font-black text-foreground">{open}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Total Disputes</p>
            <h3 className="text-2xl font-black text-foreground">{total}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Resolved</p>
            <h3 className="text-2xl font-black text-foreground">{resolved}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading disputes...</div>
        ) : disputes.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No active disputes! The platform is safe.</div>
        ) : (
          <DataTable columns={columns} data={disputes} />
        )}
      </div>
    </div>
  );
}
