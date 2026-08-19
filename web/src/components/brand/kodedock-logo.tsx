import Link from "next/link";

export function KodeDockLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center">
      <span className="text-[22px] font-black tracking-tight text-slate-900">
        Kode<span className="text-blue-600">Dock</span>
      </span>
    </Link>
  );
}
