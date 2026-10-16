"use client";
import { geocodeRequest } from "@/Until/googleMaps";

// Where the customer needs the service. It is set from the search (a ZIP or "use my location"), kept in this
// browser, and sent with Buddy searches so Buddies are listed by distance.
const KEY = "ab-location";
export const LOCATION_EVENT = "ab-location";

// A rough box around the US, including Alaska and Hawaii. It drops any location saved before the site became US only.
const inUS = (l) => l && l.lat > 18 && l.lat < 72 && l.long > -180 && l.long < -65;

export const getSavedLocation = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return inUS(saved) ? saved : null;
  } catch {
    return null;
  }
};

// saveLocation(null) forgets it, so a cleared location does not come back on the next page.
export const saveLocation = (loc) => {
  try {
    if (loc) localStorage.setItem(KEY, JSON.stringify(loc));
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(LOCATION_EVENT));
};

// Google's Geocoder through the Maps script. `pick` chooses which result to use (the first one by default).
const geocode = async (request, pick = (r) => r[0]) => {
  const hit = pick(await geocodeRequest(request));
  if (!hit) return null;
  const part = (type) => hit.address_components.find((c) => c.types.includes(type))?.short_name || "";
  const zip = part("postal_code");
  const town = part("locality") || part("postal_town") || part("sublocality");
  return {
    country: part("country"),
    zip,
    label: [town, [part("administrative_area_level_1"), zip].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    lat: hit.geometry.location.lat(),
    long: hit.geometry.location.lng(),
  };
};

// Turns a typed US street address into coordinates, or returns null. The booking form needs lat/long for distance.
export const locateAddress = (text) => geocode({ address: text, componentRestrictions: { country: "US" } });

// Turns a ZIP such as "02493" into { zip, label: "Weston, MA 02493", lat, long }, or returns null if it is not a US ZIP.
export const locateZip = (zip) => geocode({ componentRestrictions: { postalCode: zip, country: "US" } });

// Finds the browser's position and names it by its ZIP. It rejects with "denied" when the customer declines, or
// "outside" when they are outside the US, because Any-Buddy only serves US addresses.
export const locateMe = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("denied"));
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const named = await geocode(
          { location: { lat: coords.latitude, lng: coords.longitude } },
          (r) => r.find((x) => x.types.includes("postal_code")) ?? r[0],
        ).catch(() => null);
        if (named?.country !== "US") return reject(new Error("outside"));
        resolve({ ...named, lat: coords.latitude, long: coords.longitude });
      },
      () => reject(new Error("denied")),
      { timeout: 10000 },
    );
  });

// Lets any part of a page open the header search with the cursor in a field (for example Home's "Search any task or pro").
export const OPEN_SEARCH_EVENT = "ab-open-search";
export const openSiteSearch = (field = "service") => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT, { detail: field }));
