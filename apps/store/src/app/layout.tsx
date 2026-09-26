import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { StoreNavbar } from "../components/layout/StoreNavbar";
import { StoreFooter } from "../components/layout/StoreFooter";

export const metadata: Metadata = {
  title: "KodeDock Store | The Verified Codebase & Architecture Marketplace",
  description:
    "Explore, buy, and instantly deploy verified software architectures, full-stack SaaS boilerplates, and developer tooling with cryptographic Ed25519 licensing.",
  icons: {
    icon: "/kd.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>
      <body>
        <StoreNavbar />
        <main style={{ flex: 1 }}>{children}</main>
        <StoreFooter />
      </body>
    </html>
  );
}
