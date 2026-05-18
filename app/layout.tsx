import type { Metadata, Viewport } from "next";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "AI Secretary",
  description: "NUT's personal AI secretary — daily brief, lessons, and research",
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
  themeColor: "#0a0a0a",
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
    <html lang="th">
      <body className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased min-h-screen pb-20">
        <main className="max-w-3xl mx-auto">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
