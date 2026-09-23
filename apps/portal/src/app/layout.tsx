import type { Metadata } from "next";
import "./globals.css";
import { PortalShell } from "@/components/PortalShell";

export const metadata: Metadata = {
  title: "Buyer Developer Portal | KodeDock",
  description: "Manage purchased software, cryptographic license keys, and signed 60-second downloads.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>
      <body className="kodedock-shell">
        <PortalShell>{children}</PortalShell>
      </body>
    </html>
  );
}
