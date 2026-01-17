import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publicPaths = ["/", "/login", "/signup", "/auth/callback", "/set-password"]; // TOPとログイン・サインアップ、認証コールバック、パスワード設定は誰でも閲覧可

  // _next/static や画像などのアセットはスキップ
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    publicPaths.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const authCookie = req.cookies.get("auth")?.value;
  if (!authCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};
