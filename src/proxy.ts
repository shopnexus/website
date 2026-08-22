import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách các trang yêu cầu đăng nhập
const protectedRoutes = ["/account", "/account/orders", "/account/refunds", "/admin", "/inbox", "/sell", "/settings", "/cart", "/notifications"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // `access_token` sống đúng 15 phút — cookie của nó tự hết hạn theo đúng thiết kế, độc lập
  // với việc phiên đăng nhập còn sống hay không. `refresh_token` mới là bằng chứng của phiên
  // (30 ngày, cùng TTL với session phía server): gác cổng bằng access token nghĩa là bất kỳ ai
  // ngồi yên quá 15 phút rồi điều hướng sang trang khác đều bị đá về login ở đây — trước khi
  // `apiFetch` (src/api/runtime-config.ts) có cơ hội gọi `/token/refresh`, vì middleware này
  // chạy trước mọi request, kể cả điều hướng phía client trong App Router.
  const hasSession = Boolean(request.cookies.get("refresh_token")?.value);

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !hasSession) {
    // Nếu vào trang bảo vệ mà chưa đăng nhập -> chuyển về login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Trang đăng nhập KHÔNG bị chặn khi đã có cookie phiên. Chặn ở đây biến /login thành cái
  // bẫy: `refresh_token` sống 30 ngày và vẫn nằm đó sau khi phiên phía server đã chết hoặc bị
  // thu hồi, nên giao diện hiện "Đăng nhập" còn middleware lại đá về "/" — không còn đường nào
  // đăng nhập lại. Đổi tài khoản cũng là việc chính đáng: đăng nhập lần nữa chỉ đơn giản là
  // thay phiên hiện tại. Trang đăng nhập tự nói rằng bạn đang đăng nhập bằng ai.

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
