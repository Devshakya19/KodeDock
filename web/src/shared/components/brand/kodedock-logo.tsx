import Link from "next/link";

export function KodeDockLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center">
      <span className="text-[22px] font-black tracking-tight text-foreground">
        Kode<span className="text-accent">Dock</span>
      </span>
    </Link>
  );
}
