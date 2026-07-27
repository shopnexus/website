import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Load Manrope for headings and display text
const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
  display: "swap",
});

// Load Inter for body and label text
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ShopNexus – Giá tốt, gần bạn, chốt nhanh!",
    template: "%s | ShopNexus",
  },
  description:
    "Nền tảng thương mại điện tử C2C uy tín hàng đầu, kết nối người mua và người bán một cách an toàn, minh bạch và tiện lợi.",
  keywords: ["mua bán", "c2c", "marketplace", "shopnexus", "second hand"],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/*
         * Material Symbols Outlined — loaded via stylesheet for icon font.
         * next/font does not support icon fonts (no latin subsetting).
         * Using a preconnect + stylesheet is the standard approach per Google Fonts docs.
         */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background animate-page-fade-in">
        <Navbar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
