import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { theme } from "@/lib/theme";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeHaat",
  description:
    "Buy and sell production-grade digital assets with seamless GitHub integration. No .zip files — code delivered directly to your GitHub. Starting from ₹49. Only 2.5% commission.",
  keywords: [
    "CodeHaat",
    "digital marketplace",
    "code marketplace",
    "developer tools",
    "GitHub integration",
    "buy source code",
    "sell templates",
    "India marketplace",
    "B.Tech projects",
    "UI kits",
    "web templates",
  ],
  authors: [{ name: "CodeHaat" }],
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-10 -10 89 65' width='64' height='64' fill='none'><style>@media (prefers-color-scheme: light) { .ch-logo { fill: black; } } @media (prefers-color-scheme: dark) { .ch-logo { fill: white; } }</style><path class='ch-logo' d='M26.304 44.8C24.0427 44.8 21.6747 44.6293 19.2 44.288C16.768 43.904 14.4 43.264 12.096 42.368C9.83465 41.4293 7.78665 40.1493 5.95199 38.528C4.11732 36.9067 2.66665 34.8587 1.59999 32.384C0.533321 29.9093 -1.21593e-05 26.9013 -1.21593e-05 23.36V-1.52588e-05H30.208V7.03999H7.42399V23.296C7.42399 26.5387 7.99999 29.1413 9.15199 31.104C10.3467 33.0667 11.8827 34.5387 13.76 35.52C15.6373 36.5013 17.664 37.1627 19.84 37.504C22.0587 37.8027 24.2133 37.952 26.304 37.952H30.144V44.8H26.304ZM37.5925 44.8V-1.52588e-05H45.0165V18.24H61.4005V-1.52588e-05H68.8245V44.8H61.4005V25.28H45.0165V44.8H37.5925Z'/></svg>",
        type: "image/svg+xml",
        sizes: "64x64",
      },
    ],
  },
  openGraph: {
    title: "CodeHaat",
    description:
      "Buy and sell production-grade digital assets. GitHub repo delivery. Only 2.5% commission.",
    url: "https://codehaat.com",
    siteName: "CodeHaat",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeHaat — India's #1 Digital Code Marketplace",
    description:
      "No .zip files. GitHub repos delivered instantly. Only 2.5% commission.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${theme.layout.page}`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
