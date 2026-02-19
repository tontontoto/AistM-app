import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publicPaths = ["/", "/login", "/signup", "/set-password"]; // TOPとログイン・サインアップ、パスワード設定は誰でも閲覧可

  // _next/static や画像などのアセットはスキップ
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    publicPaths.includes(pathname)
  ) {
    // ログイン済みならログイン/新規登録画面へ行かせない
    const authCookie = req.cookies.get("auth")?.value;
    if (authCookie && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
      const url = req.nextUrl.clone();
      url.pathname = "/projects";
      return NextResponse.redirect(url);
    }

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
