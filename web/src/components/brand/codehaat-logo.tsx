import { Terminal } from "lucide-react";
import Link from "next/link";

export function CodeHaatLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
        <Terminal className="w-4.5 h-4.5" />
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-950">
        Code<span className="text-slate-600">Haat</span>
      </span>
    </Link>
  );
}
