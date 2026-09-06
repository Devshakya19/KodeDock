import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KodeDock | The Zero-Mock Code Escrow Marketplace",
  description: "Buy and sell verified production codebases with automated 48-hour escrow protection, AST security scanning, and bank-grade fintech.",
  icons: {
    icon: "/icons/logo/kd.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#1D1D21] text-[#EDEDF0]">{children}</body>
    </html>
  );
}
