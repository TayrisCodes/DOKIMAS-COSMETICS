import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import PwaProvider from "@/components/PwaProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dokimas Cosmetics - Premium Natural Beauty Products",
  description: "Discover luxury cosmetics crafted with natural ingredients. Shop aftershave, body oils, deodorants, facial cleansers and more.",
  keywords: ["cosmetics", "beauty", "skincare", "natural products", "Ethiopia", "Dokimas"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f7e7f0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dokimas" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <PwaProvider>
          {children}
          <Toaster />
        </PwaProvider>
      </body>
    </html>
  );
}
