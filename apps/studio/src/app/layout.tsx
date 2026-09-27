import type { Metadata } from "next";
import "./globals.css";
import { StudioShell } from "@/components/StudioShell";

export const metadata: Metadata = {
  title: "KodeDock | Architecture & Marketplace Studio Console",
  description: "Monetize your codebases, publish software boilerplates, manage version releases, and request payouts with 95% creator revenue share.",
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
        <StudioShell>{children}</StudioShell>
      </body>
    </html>
  );
}
