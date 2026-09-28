import Provider from "@/Components/Provider/Provider";
import { headers } from "next/headers";
import "@/Components/content.css";

// About, Terms, Privacy and Support are also opened inside the Android app (CmsScreen, SupportUsScreen), which has
// its own top bar. There they stay bare; on the website they get the normal header, breadcrumb and footer.
// Android WebView marks itself with "; wv)"; an iOS in-app view has no "Safari" in its user agent.
export default async function layout({ children }) {
  const ua = (await headers()).get("user-agent") || "";
  const inApp = /; wv\)/.test(ua) || (/iPhone|iPad/.test(ua) && !/Safari/.test(ua));
  const page = <div className="ab-container ab-legal">{children}</div>;
  return inApp ? page : <Provider>{page}</Provider>;
}
