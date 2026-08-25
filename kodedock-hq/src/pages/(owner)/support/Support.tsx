import { useState } from "react";
import { LifeBuoy, Clock, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

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

const TicketActionCell = ({ ticket }: { ticket: SupportTicket }) => {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);

  const mutation = useMutation({
    mutationFn: async (status: string) => {
      setProcessing(true);
      await api.put(`/api/hq/support/tickets/${ticket.id}/status`, { status });
    },
    onSuccess: () => {
      toast.success("Ticket status updated");
      queryClient.invalidateQueries({ queryKey: ['hq-support-tickets'] });
    },
    onError: () => {
      toast.error("Failed to update ticket status");
    },
    onSettled: () => setProcessing(false)
  });

  if (ticket.status !== 'open' && ticket.status !== 'in_progress') {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  return (
    <div className="flex justify-end gap-2">
      {ticket.status === 'open' && (
        <button 
          onClick={() => mutation.mutate('in_progress')}
          disabled={processing}
          className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded hover:bg-amber-500/20 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <Clock className="w-3 h-3" /> Progress
        </button>
      )}
      <button 
        onClick={() => mutation.mutate('resolved')}
        disabled={processing}
        className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        <CheckCircle className="w-3 h-3" /> Resolve
      </button>
      <button 
        onClick={() => mutation.mutate('closed')}
        disabled={processing}
        className="px-2.5 py-1 bg-secondary text-foreground rounded hover:bg-secondary/80 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        <XCircle className="w-3 h-3" /> Close
      </button>
    </div>
  );
};

const columns: ColumnDef<SupportTicket>[] = [
  {
    accessorKey: "subject",
    header: "Subject & Message",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground max-w-[300px] truncate">{row.original.subject}</p>
        <p className="text-xs text-muted-foreground mt-0.5 max-w-[300px] truncate">
          {row.original.message}
        </p>
      </div>
    ),
  },
  {
    id: "user",
    header: "User",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.user_name || "No Name"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{row.original.user_email || "No Email"}</p>
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority;
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
          priority === 'urgent' ? "bg-rose-500 text-white" :
          priority === 'high' ? "bg-orange-500/20 text-orange-500" :
          priority === 'low' ? "bg-slate-500/20 text-slate-500" :
          "bg-blue-500/20 text-blue-500"
        )}>
          {priority}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border inline-flex items-center gap-1",
          status === 'open' ? "bg-sky-500/10 text-sky-500 border-sky-500/20" :
          status === 'in_progress' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          status === 'resolved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
          "bg-secondary text-muted-foreground border-border"
        )}>
          {status.replace('_', ' ')}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <TicketActionCell ticket={row.original} />,
  }
];

export default function Support() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['hq-support-tickets'],
    queryFn: async () => await api.get("/api/hq/support/tickets?limit=100")
  });

  const tickets: SupportTicket[] = response?.data || [];
  
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'open').length;
  const inProgress = tickets.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LifeBuoy className="h-8 w-8 text-sky-500" />
            Support Inbox
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage and resolve user queries and issues.</p>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Open Tickets</p>
            <h3 className="text-2xl font-black text-foreground">{open}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">In Progress</p>
            <h3 className="text-2xl font-black text-foreground">{inProgress}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Total Tickets</p>
            <h3 className="text-2xl font-black text-foreground">{total}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Inbox zero! No active support tickets.</div>
        ) : (
          <DataTable columns={columns} data={tickets} />
        )}
      </div>
    </div>
  );
}
