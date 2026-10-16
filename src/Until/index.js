import moment from "moment";

// Google Maps browser key, set per environment (Vercel: NEXT_PUBLIC_GOOGLE_MAPS_KEY). Never hard-code keys here.
export const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

// Set per environment in .env.local (never hard-code the live server).
export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const TOKEN_NAME = "AnyBuddyWebToken";
export const TOKEN_NAME_REG = "AnyBuddyWebTokenReg";
// Set to "login" when the code screen is finishing an unverified login (not a password reset).
export const OTP_FOR = "AnyBuddyWebOtpFor";
export const FMC_TOKEN = "AnyBuddyWebFMC"; // old browser-push cookie: logout still clears it

export const ChangeName = (name) => {
  let newName = name
    ?.toLowerCase()
    ?.replaceAll(/[\s~`!@#$%^&*()_+\-={[}\]|\\:;"'<,>.?/]+/g, "-");
  return newName;
};

export function DateDisplay(createdAt) {
  moment.locale("en");

  const now = moment();
  const created = moment(createdAt);

  const diffInHours = now.diff(created, "hours");
  const diffInDays = now.diff(created, "days");
  const diffInWeeks = now.diff(created, "weeks");

  if (diffInDays === 1) {
    return "Yesterday";
  }

  if (diffInDays >= 7 && diffInWeeks < 3) {
    return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
  }

  if (diffInWeeks >= 3 || diffInHours >= 24) {
    return created.format("MMM D, YYYY, h:mm A"); // US order: "Sep 28, 2026, 1:05 PM"
  }

  const relativeTime = created.fromNow();
  if (/few seconds/.test(relativeTime)) return "Just now";

  return relativeTime
    .replace(" minutes", " min")
    .replace(" minute", " min")
    .replace(" seconds", " secs")
    .replace(" second", " sec")
    .replace(" hours", " hrs")
    .replace(" hour", " hr")
    .replace("a few", " few")
    .replace("an ", "1 ")
    .replace("a ", "1 ");
}

export function ShowPrice(price) {
  const formattedPrice = price
    ? parseFloat(price).toLocaleString("en-US", { // US site: 100,000.00 grouping (en-IN gave 1,00,000.00)
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return `$${formattedPrice}`;
}
// A Buddy's area for customers: "Boston · travels up to 10 mi". City and miles only, never the street.
// Buddies without travelMiles travel 62 mi (the backend default, DEFAULT_TRAVEL_MILES).
export const buddyArea = (city, travelMiles) =>
  city ? `${city} · travels up to ${travelMiles ?? 62} mi` : `Travels up to ${travelMiles ?? 62} mi`;
// "From $45/hr" / "From $120/day" (cents only when not whole): the iOS app's ServiceRow.fromPrice rule. The nearby price
// when the API sent one (homepage called with lat/long), else fromPrice. A row without a price (sub-categories list)
// (older API) borrows the homepage entry with the same slug when `homepageGroups` is given. "" when unpriced: never "$0".
export function fromPrice(s, homepageGroups) {
  const has = (x) => typeof x?.fromPrice === "number" || typeof x?.fromPriceNearby === "number";
  if (!has(s) && homepageGroups) s = homepageGroups.flatMap((g) => g.services || []).find((x) => x.slug === s?.slug) || s;
  const near = typeof s?.fromPriceNearby === "number";
  const p = near ? s.fromPriceNearby : s?.fromPrice;
  if (!(p > 0)) return "";
  const cents = Math.round(p * 100);
  const d = cents % 100 === 0 ? 0 : 2;
  const money = (cents / 100).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  return `From $${money}${{ hour: "/hr", day: "/day" }[near ? s.priceUnitNearby : s.priceUnit] || ""}`;
}
// Store badges and the app sections stay on show, but the old store apps are withdrawn, so no
// badge links anywhere until the new apps ship. When they do, put the new links in APP_LINKS and set STORE_LINKS_LIVE.
export const SHOW_APP_BADGES = true;
export const STORE_LINKS_LIVE = false;
// The Buddy (provider) website: "Join as a Buddy" goes to its sign-up, "Buddy log in" to its log-in.
export const PRO_URL = (process.env.NEXT_PUBLIC_PRO_URL || "https://pro.any-buddy.com").replace(/\/$/, "");

// Store links for the customer app (footer + Home). Empty = not published yet; its badge is not shown.
export const APP_LINKS = {
  app: "https://apps.apple.com/us/app/any-buddy/id6770849160",
  play: "", // Google Play link — until set, the badge shows but is not clickable
};

// Where login sends the customer: the page they were on (saved in the "path" cookie before /login), used once.
// Only same-site paths, so the cookie can never send someone to another website.
export const pageAfterLogin = (Cookies) => {
  const saved = Cookies.get("path");
  Cookies.remove("path");
  return saved?.startsWith("/") && !saved.startsWith("//") ? saved : "/";
};
