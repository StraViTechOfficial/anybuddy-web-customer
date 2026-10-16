import Cookies from "js-cookie";

// Settings for every cookie this site writes, including the login token. In production they are sent over HTTPS
// only, and never on cross-site requests.
export default Cookies.withAttributes({ path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
