import Cookies from "js-cookie";

// Every cookie this site writes (login token included): HTTPS only in production, not sent on cross-site requests.
export default Cookies.withAttributes({ path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
