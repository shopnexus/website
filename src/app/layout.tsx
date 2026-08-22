import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/api/QueryProvider";
import AuthSync from "@/components/auth/AuthSync";
import RealtimeProvider from "@/realtime/RealtimeProvider";

// One family for the whole app, drawn for Vietnamese. Not a variable font, so the weights
// are listed: only those the type scale actually uses, or every extra is a file to download.
const sansVN = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-vn",
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
      className={`${sansVN.variable} h-full antialiased`}
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
            className: "!font-body !text-label-md",
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
          <AuthSync />
          <RealtimeProvider>
            <StorefrontChrome>{children}</StorefrontChrome>
          </RealtimeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
