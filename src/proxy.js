import { NextResponse } from "next/server";
import { TOKEN_NAME } from "./Until";

// Runs before the pages that need a login: sends guests to /login, and keeps those pages out of any cache.
export default function proxy(request) {
  const response = NextResponse.next();

  // Set Cache-Control headers to disable caching
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  const token = request.cookies.get(TOKEN_NAME);

  if (!token) {
    // Log in first, then come back here (the login forms read the "path" cookie).
    const toLogin = NextResponse.redirect(new URL("/login", request.url));
    toLogin.cookies.set("path", request.nextUrl.pathname);
    return toLogin;
  }
  return response;
}

export const config = {
  matcher: ["/profile/:path*", "/booking/:path*", "/notification/:path*"], // pages that need a login
};
