import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/api/QueryProvider";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
  display: "swap",
});

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
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            className: "!font-body !text-[14px] !font-medium",
            style: {
              background: '#ffffff',
              color: '#1a1c1b',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              padding: '12px 16px',
            },
            success: {
              icon: (
                <div className="w-6 h-6 rounded-full bg-[#e6f0ef] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-[#00685f]" style={{ fontWeight: 600 }}>check</span>
                </div>
              ),
              style: {
                borderLeft: '4px solid #00685f',
              },
            },
            error: {
              icon: (
                <div className="w-6 h-6 rounded-full bg-[#ffdad6] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]" style={{ fontWeight: 600 }}>close</span>
                </div>
              ),
              style: {
                borderLeft: '4px solid #ba1a1a',
              },
            },
          }}
        />
        <QueryProvider>
          <Navbar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
