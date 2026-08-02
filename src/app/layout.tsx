import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

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
            style: {
              background: '#F9FAFB', // surface
              color: '#111827', // on-surface
              borderRadius: '8px',
              border: '1px solid #E5E7EB', // outline-variant
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
            error: {
              style: {
                background: '#FEF2F2', // error container
                color: '#991B1B', // on-error container
                border: '1px solid #FCA5A5',
              },
              iconTheme: {
                primary: '#DC2626', // error
                secondary: '#FEF2F2',
              }
            },
            success: {
              style: {
                background: '#F0FDF4', // success container
                color: '#166534',
                border: '1px solid #86EFAC',
              },
              iconTheme: {
                primary: '#16A34A',
                secondary: '#F0FDF4',
              }
            }
          }}
        />
        <Navbar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
