import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Wallet, IndianRupee, Building2, History, Banknote } from "lucide-react";

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
  payout_details: {
    account_holder_name: string | null;
    account_number: string | null;
    ifsc_code: string | null;
    bank_name: string | null;
    upi_id: string | null;
  } | null;
}

export default function Finance() {
  const { token } = useAuth();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const [statsRes, withRes] = await Promise.all([
          fetch("http://localhost:4001/api/hq/finance/stats", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("http://localhost:4001/api/hq/finance/withdrawals?limit=20", { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        
        const statsData = await statsRes.json();
        const withData = await withRes.json();

        if (statsData.status === "success") setStats(statsData.data);
        if (withData.status === "success") setWithdrawals(withData.data);
      } catch (err) {
        console.error("Failed to fetch finance data", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchFinanceData();
  }, [token]);

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance & Payouts</h1>
        <p className="text-muted-foreground mt-1">Platform revenue, escrow funds, and seller withdrawals.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <Building2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Platform Revenue</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              {stats ? formatCurrency(stats.total_platform_fee_paise) : '---'}
            </h3>
          </div>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Wallet className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Funds in Escrow (Held)</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              {stats ? formatCurrency(stats.total_escrow_paise) : '---'}
            </h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <IndianRupee className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Payouts Done</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              {stats ? formatCurrency(stats.total_withdrawals_paise) : '---'}
            </h3>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <History className="h-5 w-5 text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Recent Seller Withdrawals</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payout Method</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No withdrawals recorded yet.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.transaction_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">
                      {w.created_at ? new Date(w.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {w.seller_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {formatCurrency(w.amount_paise)}
                    </td>
                    <td className="px-6 py-4">
                      {w.payout_type === 'upi' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                          UPI
                        </span>
                      ) : w.payout_type === 'bank_account' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          <Banknote className="h-3 w-3" /> Bank Transfer
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not Setup</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                      {w.payout_type === 'upi' && w.payout_details?.upi_id ? (
                        <span>{w.payout_details.upi_id}</span>
                      ) : w.payout_type === 'bank_account' && w.payout_details?.account_number ? (
                        <div className="flex flex-col items-end">
                          <span className="text-foreground">{w.payout_details.account_number}</span>
                          <span>IFSC: {w.payout_details.ifsc_code}</span>
                        </div>
                      ) : (
                        'Missing Details'
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
