import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, IndianRupee, Building2, History, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

interface FinanceStats {
  total_platform_fee_paise: number;
  total_escrow_paise: number;
  total_withdrawals_paise: number;
}

interface Withdrawal {
  transaction_id: string;
  seller_id: string;
  seller_name: string | null;
  amount_paise: number;
  created_at: string | null;
  payout_type: string | null;
  payout_details: any;
}

interface PayoutRequest {
  id: string;
  seller_id: string;
  seller_name: string | null;
  amount_paise: number;
  status: string;
  payout_details: any;
  created_at: string | null;
}

const formatCurrency = (paise: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
};

// --- PAYOUT ACTION CELL ---
const PayoutActionCell = ({ request }: { request: PayoutRequest }) => {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);

  const mutation = useMutation({
    mutationFn: async (status: string) => {
      setProcessing(true);
      await api.put(`/api/hq/finance/payouts/${request.id}/process`, { status, notes: `Processed manually via HQ` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hq-finance-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['hq-finance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hq-finance-withdrawals'] });
    },
    onSettled: () => setProcessing(false)
  });

  return (
    <div className="flex justify-end gap-2">
      <button 
        onClick={() => { if(confirm('Reject this payout?')) mutation.mutate("REJECTED") }}
        disabled={processing}
        className="px-3 py-1.5 border border-red-500/30 text-red-500 rounded hover:bg-red-500/10 text-xs font-medium transition-colors disabled:opacity-50"
      >
        Reject
      </button>
      <button 
        onClick={() => { if(confirm('Mark as Paid?')) mutation.mutate("PAID") }}
        disabled={processing}
        className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
      >
        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
      </button>
    </div>
  );
};

// --- COLUMNS ---
const payoutColumns: ColumnDef<PayoutRequest>[] = [
  {
    accessorKey: "seller_name",
    header: "Seller",
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.seller_name || "Unknown Seller"}</span>,
  },
  {
    accessorKey: "amount_paise",
    header: "Amount",
    cell: ({ row }) => <span className="font-bold text-foreground">{formatCurrency(row.original.amount_paise)}</span>,
  },
  {
    id: "payout_info",
    header: "Payout Info",
    cell: ({ row }) => {
      const details = row.original.payout_details;
      return (
        <span className="text-muted-foreground">
          {details?.upi_id ? `UPI: ${details.upi_id}` : details?.account_number ? `A/C: ${details.account_number}` : 'No details'}
        </span>
      );
    }
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <PayoutActionCell request={row.original} />,
  }
];

const withdrawalColumns: ColumnDef<Withdrawal>[] = [
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : 'N/A'}</span>,
  },
  {
    accessorKey: "seller_name",
    header: "Seller",
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.seller_name || "Unknown Seller"}</span>,
  },
  {
    accessorKey: "amount_paise",
    header: "Amount",
    cell: ({ row }) => <span className="font-bold text-foreground">{formatCurrency(row.original.amount_paise)}</span>,
  }
];

export default function Finance() {
  const { data: statsRes } = useQuery({
    queryKey: ['hq-finance-stats'],
    queryFn: async () => await api.get('/api/hq/finance/stats')
  });

  const { data: payoutsRes, isLoading: loadingPayouts } = useQuery({
    queryKey: ['hq-finance-payouts'],
    queryFn: async () => await api.get('/api/hq/finance/payouts?status=PENDING')
  });

  const { data: withdrawalsRes, isLoading: loadingWithdrawals } = useQuery({
    queryKey: ['hq-finance-withdrawals'],
    queryFn: async () => await api.get('/api/hq/finance/withdrawals?limit=100')
  });

  const stats: FinanceStats | null = statsRes?.data || null;
  const payouts = payoutsRes?.data || [];
  const withdrawals = withdrawalsRes?.data || [];

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance & Payouts</h1>
        <p className="text-muted-foreground mt-1">Manage seller withdrawals and platform revenue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-emerald-500/10 rounded-lg"><Building2 className="h-6 w-6 text-emerald-500" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats ? formatCurrency(stats.total_platform_fee_paise) : '---'}</h3>
          </div>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-xl flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-blue-500/10 rounded-lg"><Wallet className="h-6 w-6 text-blue-500" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Funds in Escrow</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats ? formatCurrency(stats.total_escrow_paise) : '---'}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-purple-500/10 rounded-lg"><IndianRupee className="h-6 w-6 text-purple-500" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Payouts Done</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats ? formatCurrency(stats.total_withdrawals_paise) : '---'}</h3>
          </div>
        </div>
      </div>

      {/* Payout Requests */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2 bg-secondary/20">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-foreground">Pending Payout Requests</h2>
        </div>
        {loadingPayouts ? (
          <div className="p-8 text-center text-muted-foreground">Loading pending requests...</div>
        ) : (
          <DataTable columns={payoutColumns} data={payouts} />
        )}
      </div>

      {/* Withdrawals Ledger */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mt-8">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2 bg-secondary/20">
          <History className="h-5 w-5 text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Withdrawals Ledger</h2>
        </div>
        {loadingWithdrawals ? (
          <div className="p-8 text-center text-muted-foreground">Loading withdrawals...</div>
        ) : (
          <DataTable columns={withdrawalColumns} data={withdrawals} />
        )}
      </div>
    </div>
  );
}
