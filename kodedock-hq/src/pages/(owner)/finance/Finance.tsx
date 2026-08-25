import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, IndianRupee, Building2, History, AlertCircle, CheckCircle2 } from "lucide-react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
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

function MetricCard({ title, value, icon: Icon, subtitle, colorClass = "text-primary", bgClass = "bg-primary/10" }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`h-10 w-10 rounded-lg ${bgClass} flex items-center justify-center transition-colors`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-foreground tracking-tight tabular-nums">{value}</h3>
        <p className="text-sm font-semibold text-muted-foreground mt-1">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

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

  const { data: hqStatsRes } = useQuery({
    queryKey: ['hq-stats'],
    queryFn: async () => await api.get('/api/hq/stats')
  });

  const stats: FinanceStats | null = statsRes?.data || null;
  const payouts = payoutsRes?.data || [];
  const withdrawals = withdrawalsRes?.data || [];
  
  const revenueChartData = hqStatsRes?.data?.data?.revenue_chart || [];

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance & Payouts</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage seller withdrawals and platform revenue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Platform Revenue" 
          value={stats ? formatCurrency(stats.total_platform_fee_paise) : '₹0'} 
          icon={Building2}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10 group-hover:bg-emerald-500/20"
        />
        <MetricCard 
          title="Funds in Escrow" 
          value={stats ? formatCurrency(stats.total_escrow_paise) : '₹0'} 
          icon={Wallet}
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10 group-hover:bg-blue-500/20"
        />
        <MetricCard 
          title="Total Payouts Done" 
          value={stats ? formatCurrency(stats.total_withdrawals_paise) : '₹0'} 
          icon={IndianRupee}
          colorClass="text-purple-500"
          bgClass="bg-purple-500/10 group-hover:bg-purple-500/20"
        />
      </div>

      {/* Revenue Chart Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg text-foreground">Revenue Flow</h3>
            <p className="text-sm text-muted-foreground font-medium">Platform GMV processed over last 7 days</p>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFinance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                tickFormatter={(val) => `₹${val/1000}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderRadius: '12px',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorFinance)" 
              />
            </AreaChart>
          </ResponsiveContainer>
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
