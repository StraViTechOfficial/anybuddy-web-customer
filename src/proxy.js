import { NextResponse } from "next/server";
import { TOKEN_NAME } from "./Until";

// Runs before every page that needs a login. It sends guests to /login and makes sure these pages are never cached.
export default function proxy(request) {
  const response = NextResponse.next();

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  const token = request.cookies.get(TOKEN_NAME);

  if (!token) {
    // The guest logs in first and then comes back here, because the login forms read the "path" cookie.
    const toLogin = NextResponse.redirect(new URL("/login", request.url));
    toLogin.cookies.set("path", request.nextUrl.pathname);
    return toLogin;
  }
  return response;
}

export const config = {
  matcher: ["/profile/:path*", "/booking/:path*", "/notification/:path*"], // The pages that need a login.
};
