import moment from "moment";
import { UAParser } from "ua-parser-js";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export const getDeviceInfo = (userAgent) => {
  const parser = new UAParser();
  parser.setUA(userAgent);
  const os = parser.getOS(); // Returns { name, version }
  return os;
};

export const mapApiKey = "AIzaSyC9piPp1Fur-HMWVQ50PbbU9rzIo9Fpo6I";

// export const STRIPE_PUBLISHABLE_KEY =
//   "pk_test_51Rpj4qPnyDiIIqQRngwONHYZcQ6EiabVBQa1ka1xV6NmHSXoY3OIwz14XDnyKVcRbOK14T5YRyFkk3dxAYDI0kqp00QLXsdRAp";

// Set per environment in .env.local (never hard-code the live server).
export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;
// export const BASE_API_URL = "https://uae.appsstart.com/anybuddy/api/";

export const TOKEN_NAME = "AnyBuddyWebToken";
export const TOKEN_NAME_REG = "AnyBuddyWebTokenReg";
// BUG-13: set to "login" when the code screen is finishing an unverified login (not a password reset).
export const OTP_FOR = "AnyBuddyWebOtpFor";
export const FMC_TOKEN = "AnyBuddyWebFMC";

export const firebaseConfig = {
  apiKey: "AIzaSyBp1p0H0Y3qIJkQDCRjuGmdnGH-lUdiIB0",
  authDomain: "any-buddy.firebaseapp.com",
  projectId: "any-buddy",
  storageBucket: "any-buddy.firebasestorage.app",
  messagingSenderId: "1014974926067",
  appId: "1:1014974926067:web:cf58150f1a75d54e19fb86",
};
export const vapidKey =
  "BDyJtITO2IOmGGW25x5ol9qWbQpOKm6PrvCflseTUrZdOpQcJipJowVvoMSwfFg7hUCVJ-SFiGgWIzR-RmlqXNg";

const generateFallbackDeviceId = () => {
  // Use browser-specific details or random generator
  const randomId = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `fallback-${randomId}-${timestamp}`;
};

export const getDeviceId = async () => {
  const fallbackId = generateFallbackDeviceId();

  // console.log(fallbackId, "fallbackId");

  if (typeof window !== "undefined") {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId || fallbackId; // Unique ID or fallback
    } catch (error) {
      console.error("Error getting device ID:", error);
      return fallbackId; // Default value in case of error
    }
  }
  return fallbackId; // Default for non-browser environments
};

export const ChangeName = (name) => {
  let newName = name
    ?.toLowerCase()
    ?.replaceAll(/[\s~`!@#$%^&*()_+\-={[}\]|\\:;"'<,>.?/]+/g, "-");
  return newName;
};

export const normalizeImage = (value) => {
  if (!value) return { url: "" };
  if (typeof value === "object" && value.url) return { url: String(value.url) };
  if (typeof value === "string") return { url: value };
  return { url: "" };
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

export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0";

  if (num >= 1_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b";
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
}

export function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  else if (hour < 17) return "Good Afternoon";
  else return "Good Evening";
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
export const ThreeSlideSettings = {
  dots: true,
  infinite: true,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: true,
  slidesToShow: 3,
  slidesToScroll: 1,
  initialSlide: 1,
  className: "settings",
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 590,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 400,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
  ],
};
export const ThreeSlideSettingsNoInfinite = {
  dots: true,
  infinite: false,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: true,
  slidesToShow: 3,
  slidesToScroll: 1,
  initialSlide: 1,
  className: "settings",
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 590,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 400,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
  ],
};
export const TwoSlideSettings = {
  dots: true,
  infinite: true,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: true,
  slidesToShow: 2,
  slidesToScroll: 1,
  initialSlide: 0,
  className: "Carouselsettings",
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 590,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 400,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
  ],
};
export const FourSlideSettings = {
  dots: true,
  infinite: false,
  centerMode: false,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: true,
  slidesToShow: 4.3,
  slidesToScroll: 1,
  initialSlide: 0,
  className: "FourSlideSettings",
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 590,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 450,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
  ],
};
export const FourSlideSettingsNoInfinite = {
  dots: true,
  infinite: false,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: true,
  slidesToShow: 4,
  slidesToScroll: 1,
  initialSlide: 1,
  className: "settings",
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 590,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 400,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
  ],
};
export const SingleSlideSettings = {
  dots: true,
  infinite: true,
  autoplay: false,
  autoplaySpeed: 5000,
  arrows: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  initialSlide: 0,
  className: "Carouselsettings",
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        dots: true,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 590,
      settings: {
        slidesToShow: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 400,
      settings: {
        slidesToShow: 1,
        arrows: false,
      },
    },
  ],
};
export const SingleSlideSettingsNoFinite = {
  dots: true,
  infinite: false,
  autoplay: false,
  autoplaySpeed: 5000,
  arrows: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  initialSlide: 0,
  className: "Carouselsettings",
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        dots: true,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 590,
      settings: {
        slidesToShow: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 400,
      settings: {
        slidesToShow: 1,
        arrows: false,
      },
    },
  ],
};
export const FiveSlideSettings = {
  dots: false,
  infinite: true,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: true,
  slidesToShow: 5,
  slidesToScroll: 5,
  initialSlide: 1,
  className: "FiveSlideSettings",
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 590,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 450,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
  ],
};

// The old store apps are withdrawn: every store badge (and the Home app section) stays hidden until the new apps
// ship. To bring them back, put the new links in APP_LINKS and set this to true.
export const SHOW_APP_BADGES = false;
// The Buddy (provider) website: "Join as a Buddy" goes to its sign-up, "Buddy log in" to its log-in.
export const PRO_URL = (process.env.NEXT_PUBLIC_PRO_URL || "https://pro.any-buddy.com").replace(/\/$/, "");

// Store links for the customer app (footer + Home). Empty = not published yet; its badge is not shown.
export const APP_LINKS = {
  app: "https://apps.apple.com/us/app/any-buddy/id6770849160",
  play: "", // TODO(owner): Google Play link — until set, the badge shows but is not clickable
};

// Where login sends the customer: the page they were on (saved in the "path" cookie before /login), used once.
// Only same-site paths, so the cookie can never send someone to another website.
export const pageAfterLogin = (Cookies) => {
  const saved = Cookies.get("path");
  Cookies.remove("path");
  return saved?.startsWith("/") && !saved.startsWith("//") ? saved : "/";
};
