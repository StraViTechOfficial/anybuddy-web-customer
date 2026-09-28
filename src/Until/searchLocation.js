"use client";
import { mapApiKey } from "@/Until";

// Where the customer needs the service. Set from the search (ZIP or "use my location"),
// kept in this browser, and sent with provider searches so pros are listed by distance.
const KEY = "ab-location";
export const LOCATION_EVENT = "ab-location";

// Rough US box (incl. Alaska and Hawaii): drops a location saved before the US-only rule.
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

const geocode = async (query) => {
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${query}&key=${mapApiKey}`);
  const data = await res.json();
  const hit = data.results?.[0];
  if (!hit) return null;
  const part = (type) => hit.address_components.find((c) => c.types.includes(type))?.short_name || "";
  const zip = part("postal_code");
  const town = part("locality") || part("postal_town") || part("sublocality");
  return {
    country: part("country"),
    zip,
    label: [town, [part("administrative_area_level_1"), zip].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    lat: hit.geometry.location.lat,
    long: hit.geometry.location.lng,
  };
};

// A typed US street address → its coordinates (the booking form needs lat/long for distance), or null.
export const locateAddress = (text) => geocode(`address=${encodeURIComponent(text)}&components=country:US`);

// "02493" → { zip, label: "Weston, MA 02493", lat, long }, or null when it is not a US ZIP.
export const locateZip = (zip) => geocode(`components=postal_code:${encodeURIComponent(zip)}|country:US`);

// The browser's position, named by its ZIP. Rejects when the customer declines ("denied")
// or is outside the US ("outside"): Any-Buddy only serves US addresses.
export const locateMe = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("denied"));
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const named = await geocode(`latlng=${coords.latitude},${coords.longitude}&result_type=postal_code`).catch(() => null);
        if (named?.country !== "US") return reject(new Error("outside"));
        resolve({ ...named, lat: coords.latitude, long: coords.longitude });
      },
      () => reject(new Error("denied")),
      { timeout: 10000 },
    );
  });

// Any part of a page can open the header search with the cursor in a field (e.g. Home "Search any task or pro").
export const OPEN_SEARCH_EVENT = "ab-open-search";
export const openSiteSearch = (field = "service") => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT, { detail: field }));
