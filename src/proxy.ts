import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách các trang yêu cầu đăng nhập
const protectedRoutes = ["/dashboard", "/orders", "/inbox", "/sell", "/settings", "/cart", "/notifications"];
// Danh sách các trang chỉ dành cho khách (guest)
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lấy token từ cookies
  const accessToken = request.cookies.get("access_token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !accessToken) {
    // Nếu vào trang bảo vệ mà chưa đăng nhập -> chuyển về login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && accessToken) {
    // Nếu vào trang login/register mà đã có token -> chuyển về trang chủ
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files with extensions (e.g., .svg, .png)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
