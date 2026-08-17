import { getServerUser } from "@/lib/auth/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowLeft, Receipt } from "lucide-react";

export default async function BillingPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // Since billing APIs are mocked for now, show an empty state
  const invoices: any[] = [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Billing & Invoices</h1>
            <p className="text-slate-500 mt-2 text-base font-medium">View your payment history and download tax invoices.</p>
          </div>
        </div>
      </div>

      {!invoices || invoices.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-16 text-center">
          <div className="w-20 h-20 rounded-[20px] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6">
            <Receipt className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No invoices found</h3>
          <p className="text-slate-500 text-base max-w-md mx-auto mb-8 font-medium">
            You don't have any billing history yet. Your invoices will automatically appear here once you make a purchase.
          </p>
          <Link href="/dashboard/purchases" className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-100 px-8 text-base font-bold text-slate-700 transition-colors hover:bg-slate-200 hover:-translate-y-0.5">
            View Order History
          </Link>
        </div>
      ) : (
        <div>
           {/* Render invoice list here in the future */}
        </div>
      )}
    </div>
  );
}
