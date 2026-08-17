import { getServerUser } from "@/lib/auth/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DownloadCloud, ArrowLeft, Search } from "lucide-react";

export default async function DownloadsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // Since we don't have a specific downloads endpoint yet, we'll show an elegant empty state
  const downloads: any[] = [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Downloads & Licenses</h1>
            <p className="text-slate-500 mt-2 text-base font-medium">Manage your digital product files and activation keys.</p>
          </div>
        </div>
      </div>

      {!downloads || downloads.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-16 text-center">
          <div className="w-20 h-20 rounded-[20px] bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <DownloadCloud className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No downloads available</h3>
          <p className="text-slate-500 text-base max-w-md mx-auto mb-8 font-medium">
            Any products you purchase that include downloadable files or license keys will appear here.
          </p>
          <Link href="/browse" className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-8 text-base font-bold text-white transition-colors hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:-translate-y-0.5">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div>
           {/* Render downloads list here in the future */}
        </div>
      )}
    </div>
  );
}
