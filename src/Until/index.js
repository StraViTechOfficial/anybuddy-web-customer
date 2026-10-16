import moment from "moment";

// The Google Maps browser key is set per environment (NEXT_PUBLIC_GOOGLE_MAPS_KEY on Vercel). Never hard-code keys here.
export const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

// The browser calls the API only through this site's proxy (src/app/api/[...path]/route.js), which adds the login token.
export const BASE_API_URL = "/api/";

// The login token and the code-step token live in httpOnly cookies that only the proxy can read. Page scripts see just
// SIGNED_IN ("1" while a session cookie exists), which tells the page whether to show the customer as signed in.
export const SESSION_COOKIE = "ab_session";
export const CODE_COOKIE = "ab_code";
export const SIGNED_IN = "ab_signed_in";
// Set to "login" when the code screen is finishing an unverified login (not a password reset).
export const OTP_FOR = "AnyBuddyWebOtpFor";
export const FMC_TOKEN = "AnyBuddyWebFMC"; // The old browser push cookie. Logging out still clears it.

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
    return created.format("MMM D, YYYY, h:mm A"); // US order, for example "Sep 28, 2026, 1:05 PM".
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
    ? parseFloat(price).toLocaleString("en-US", { // US digit grouping (100,000.00). The old en-IN format gave 1,00,000.00.
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return `$${formattedPrice}`;
}
// A Buddy's area as customers see it, for example "Boston · travels up to 10 mi". It shows the city and miles only,
// never the street. Buddies without travelMiles travel 62 miles, the backend default (DEFAULT_TRAVEL_MILES).
export const buddyArea = (city, travelMiles) =>
  city ? `${city} · travels up to ${travelMiles ?? 62} mi` : `Travels up to ${travelMiles ?? 62} mi`;
// Returns a price label such as "From $45/hr" or "From $120/day", with cents only when the amount isn't whole. This
// is the iOS app's ServiceRow.fromPrice rule. It uses the nearby price when the API sent one (when the homepage was
// called with lat/long), and fromPrice otherwise. A row without a price (the sub-categories list, from the older API)
// borrows the homepage entry with the same slug when `homepageGroups` is given. It returns "" when there is no price,
// never "$0".
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
// The store badges and app sections stay on the page, but the old store apps have been withdrawn, so there are no
// badge links anywhere until the new apps ship. When they do, put the new links in APP_LINKS and set STORE_LINKS_LIVE.
export const SHOW_APP_BADGES = true;
export const STORE_LINKS_LIVE = false;
// The Buddy website. "Join as a Buddy" goes to its sign-up page and "Buddy log in" goes to its login page.
export const PRO_URL = (process.env.NEXT_PUBLIC_PRO_URL || "https://pro.any-buddy.com").replace(/\/$/, "");

// Store links for the customer app, used in the footer and on Home. An empty link means the app is not published
// in that store yet.
export const APP_LINKS = {
  app: "https://apps.apple.com/us/app/any-buddy/id6770849160",
  play: "", // The Google Play link. Until it is set, the badge shows but can't be clicked.
};

// Where login sends the customer: the page they were on, saved in the "path" cookie before /login and used once.
// Only paths on this site are accepted, so the cookie can never send someone to another website.
export const pageAfterLogin = (Cookies) => {
  const saved = Cookies.get("path");
  Cookies.remove("path");
  return saved?.startsWith("/") && !saved.startsWith("//") ? saved : "/";
};
