import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Wallet, IndianRupee, Building2, History, Banknote, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

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

export default function Finance() {
  const { token } = useAuth();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchFinanceData();
  }, [token]);

  const fetchFinanceData = async () => {
    if (!token) return;
    try {
      const [statsRes, withRes, payRes] = await Promise.all([
        fetch(import.meta.env.VITE_API_URL + "/api/hq/finance/stats", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(import.meta.env.VITE_API_URL + "/api/hq/finance/withdrawals?limit=20", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(import.meta.env.VITE_API_URL + "/api/hq/finance/payouts?status=PENDING", { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json();
      const withData = await withRes.json();
      const payData = await payRes.json();

      if (statsData.status === "success") setStats(statsData.data);
      if (withData.status === "success") setWithdrawals(withData.data);
      if (payData.status === "success") setPayoutRequests(payData.data);
    } catch (err) {
      console.error("Failed to fetch finance data", err);
    } finally {
      setLoading(false);
    }
  };

  const processPayout = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to mark this payout as ${status}?`)) return;
    setProcessing(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/hq/finance/payouts/${id}/process`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status, notes: `Processed manually via HQ` })
      });
      if (res.ok) fetchFinanceData();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance & Payouts</h1>
        <p className="text-muted-foreground mt-1">Manage seller withdrawals and platform revenue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg"><Building2 className="h-6 w-6 text-emerald-500" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats ? formatCurrency(stats.total_platform_fee_paise) : '---'}</h3>
          </div>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-xl flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg"><Wallet className="h-6 w-6 text-blue-500" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Funds in Escrow</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats ? formatCurrency(stats.total_escrow_paise) : '---'}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl flex items-start gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg"><IndianRupee className="h-6 w-6 text-purple-500" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Payouts Done</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats ? formatCurrency(stats.total_withdrawals_paise) : '---'}</h3>
          </div>
        </div>
      </div>

      {/* Payout Requests */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-foreground">Pending Payout Requests</h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Seller</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Payout Info</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : payoutRequests.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No pending requests.</td></tr>
            ) : (
              payoutRequests.map(p => (
                <tr key={p.id} className="hover:bg-secondary/30">
                  <td className="px-6 py-4 font-medium">{p.seller_name}</td>
                  <td className="px-6 py-4 font-bold text-foreground">{formatCurrency(p.amount_paise)}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {p.payout_details?.upi_id ? `UPI: ${p.payout_details.upi_id}` : `A/C: ${p.payout_details?.account_number}`}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button 
                      onClick={() => processPayout(p.id, "REJECTED")}
                      disabled={processing === p.id}
                      className="px-3 py-1.5 border border-red-500/30 text-red-500 rounded hover:bg-red-500/10 text-xs font-medium transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => processPayout(p.id, "PAID")}
                      disabled={processing === p.id}
                      className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Withdrawals Ledger */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <History className="h-5 w-5 text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Withdrawals Ledger</h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Seller</th>
              <th className="px-6 py-4">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : withdrawals.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No records.</td></tr>
            ) : (
              withdrawals.map(w => (
                <tr key={w.transaction_id} className="hover:bg-secondary/30">
                  <td className="px-6 py-4 text-muted-foreground">{w.created_at ? new Date(w.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 font-medium">{w.seller_name}</td>
                  <td className="px-6 py-4 font-bold">{formatCurrency(w.amount_paise)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
