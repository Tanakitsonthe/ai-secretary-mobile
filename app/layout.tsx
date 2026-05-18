import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import Nav from "@/components/Nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Secretary",
  description: "Personal AI hub — daily brief, lessons, research, fitness, chat",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI Secretary",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={inter.variable}>
      <body className="min-h-screen pb-24 fade-in">
        <main className="max-w-3xl mx-auto">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
