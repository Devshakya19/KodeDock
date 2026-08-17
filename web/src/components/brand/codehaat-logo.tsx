import Link from "next/link";

export function CodeHaatLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center">
      <span className="text-[22px] font-black tracking-tight text-slate-900">
        Code<span className="text-blue-600">Haat</span>
      </span>
    </Link>
  );
}
