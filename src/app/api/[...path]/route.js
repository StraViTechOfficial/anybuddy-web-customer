// A backend-for-frontend proxy. The browser only ever calls /api/*. This handler forwards each call to BACKEND_URL
// and keeps the login token in httpOnly cookies, so page scripts (and anything injected into the page) can never read
// it. The page learns only whether someone is signed in, from the separate SIGNED_IN cookie, which holds no secret.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CODE_COOKIE, SESSION_COOKIE, SIGNED_IN } from "@/Until";

const BACKEND = process.env.BACKEND_URL?.replace(/\/$/, "");
const SESSION_AGE = 30 * 24 * 3600; // Customer tokens last a fixed 30 days on the backend.
// Older versions of this site kept the token in these cookies, readable by page scripts. They are deleted on sight.
const LEGACY = ["AnyBuddyWebToken", "AnyBuddyWebTokenReg"];
// Only what this site calls. Buddy and admin routes are never reachable through it.
const ALLOWED =
  /^(user\/(auth|homepage|services|sub-categories|cms|booking|address|support|wishlist|notification|rating-review)(\/|$)|uploads\/presign$|list-location$)/;
// The code-step token opens only these. Every other call uses the session token.
const CODE_ROUTES = /^user\/auth\/(verify-otp|resend-otp|reset-password|social-complete)$/;
const cookieBase = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" };

const payloadOf = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  } catch {
    return {};
  }
};

const endSession = (res) => [SESSION_COOKIE, CODE_COOKIE, SIGNED_IN].forEach((c) => res.cookies.delete(c));

async function handle(req, ctx) {
  const parts = (await ctx.params).path;
  // "user/../admin/x" would pass the allow-list and then resolve upstream to /admin/x, so dot segments are refused.
  if (parts.some((p) => p === "." || p === ".." || /[\\/%]/.test(p))) return NextResponse.json({ status: 0, message: "Not found." }, { status: 404 });
  const path = parts.join("/");
  const jar = await cookies();

  // Opening the login page forgets this browser's session without ending the customer's sessions on other devices,
  // which the backend logout would do.
  if (path === "session" && req.method === "DELETE") {
    const res = NextResponse.json({ status: 1 });
    endSession(res);
    return res;
  }
  if (!BACKEND) return NextResponse.json({ status: 0, message: "BACKEND_URL is not set." }, { status: 500 });
  if (!ALLOWED.test(path)) return NextResponse.json({ status: 0, message: "Not found." }, { status: 404 });

  const code = jar.get(CODE_COOKIE)?.value;
  const token = code && CODE_ROUTES.test(path) ? code : jar.get(SESSION_COOKIE)?.value;
  const headers = new Headers({ "content-type": "application/json" });
  if (token) headers.set("authtoken", token);
  // Passes on the browser's IP address, for per-person rate limits and for recording Stripe's terms acceptance. The
  // backend trusts it only when the shared key comes with it. When the key isn't set, nothing extra is sent and the
  // backend sees this server's address.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip");
  if (process.env.PROXY_SHARED_SECRET && ip) {
    headers.set("x-ab-proxy-key", process.env.PROXY_SHARED_SECRET);
    headers.set("x-ab-client-ip", ip);
  }

  let upstream;
  try {
    const body = req.method === "GET" ? undefined : (await req.text()) || undefined;
    upstream = await fetch(`${BACKEND}/${path}${req.nextUrl.search}`, { method: req.method, headers, body, cache: "no-store" });
  } catch {
    return NextResponse.json({ status: 0, message: "We can't reach Any-Buddy right now. Try again in a moment." }, { status: 502 });
  }
  const json = await upstream.json().catch(() => null);
  if (!json) {
    const busy = upstream.status === 429;
    const message = busy ? "Too many tries. Wait a few minutes and try again." : "Something went wrong. Try again.";
    return NextResponse.json({ status: 0, message }, { status: busy ? 429 : 502 });
  }

  // Take any token out of the reply and keep it as a cookie instead. Password change and reset send the new token as
  // `data` itself. A renewed token can also arrive in the X-Auth-Token header of an ordinary reply.
  let fresh = upstream.headers.get("x-auth-token");
  if (typeof json.data === "string" && json.data.split(".").length === 3) {
    fresh = json.data;
    json.data = null;
  } else if (typeof json.data?.token === "string") {
    fresh = json.data.token;
    delete json.data.token;
  }
  const res = NextResponse.json(json, { status: upstream.status });
  for (const old of LEGACY) if (jar.has(old)) res.cookies.delete(old);

  // After a password change or reset the customer signs in again with the new password, as this site always did. The
  // backend has already ended every older session, so the token it sent back is dropped.
  if (/^user\/auth\/(change-password|reset-password)$/.test(path) && upstream.ok) {
    endSession(res);
    return res;
  }
  if (fresh) {
    // A token still waiting for its code, or the 15-minute token that only allows setting a new password after a
    // forgot-password code, is a code-step token. It never counts as being signed in.
    const p = payloadOf(fresh);
    if (p.stage === "otp" || p.reset === 1) res.cookies.set(CODE_COOKIE, fresh, { ...cookieBase, maxAge: 15 * 60 });
    else {
      res.cookies.set(SESSION_COOKIE, fresh, { ...cookieBase, maxAge: SESSION_AGE });
      res.cookies.set(SIGNED_IN, "1", { ...cookieBase, httpOnly: false, maxAge: SESSION_AGE });
      res.cookies.delete(CODE_COOKIE);
    }
  }
  const expired = upstream.status === 401 || (upstream.status === 403 && /expired token/i.test(json.message ?? ""));
  // Logging out always clears this browser, even when the backend refuses (for example because the token had expired).
  if ((expired && path !== "user/auth/login") || path === "user/auth/logout" || (path === "user/auth/delete" && upstream.ok)) {
    endSession(res);
  } else if (!fresh && !jar.get(SESSION_COOKIE) && jar.get(SIGNED_IN)) {
    res.cookies.delete(SIGNED_IN); // The session cookie ran out first, so the page must stop showing the customer as signed in.
  }
  return res;
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE, handle as PATCH };
