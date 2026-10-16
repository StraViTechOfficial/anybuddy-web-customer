"use client";
import { mapApiKey } from "@/Until";

// Loads Google's Maps script once, on first use. The key is limited to our websites, so every Google call goes through
// this script (Places (New) and the Geocoder). Google refuses a website-limited key on direct web-service calls.
let boot = null;
const load = () =>
  (boot ??= new Promise((ok, fail) => {
    if (window.google?.maps?.importLibrary) return ok();
    window.__abMaps = () => ok();
    const el = document.createElement("script");
    el.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapApiKey)}&v=weekly&loading=async&callback=__abMaps`;
    el.async = true;
    el.onerror = () => {
      boot = null;
      fail(new Error("Google Maps didn't load"));
    };
    document.head.appendChild(el);
  }));

export const library = async (name) => {
  await load();
  return window.google.maps.importLibrary(name);
};

// Google's Geocoder with a request such as { address } or { location }. It returns the results, or [] when nothing matches.
export const geocodeRequest = async (request) => {
  const { Geocoder } = await library("geocoding");
  try {
    return (await new Geocoder().geocode(request)).results;
  } catch (e) {
    if (e?.code === "ZERO_RESULTS") return [];
    throw e;
  }
};

let session = null;
// Up to 5 US address suggestions while the customer types. One billing session lasts until a suggestion is picked.
export const suggest = async (input) => {
  const { AutocompleteSessionToken, AutocompleteSuggestion } = await library("places");
  session ??= new AutocompleteSessionToken();
  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({ input, sessionToken: session, includedRegionCodes: ["us"] });
  return suggestions.flatMap((s) => (s.placePrediction ? [{ label: s.placePrediction.text.toString(), place: s.placePrediction }] : [])).slice(0, 5);
};

// The picked suggestion's full address and exact point, or null if Google has no point for it.
export const placeDetails = async (prediction) => {
  const place = prediction.toPlace();
  await place.fetchFields({ fields: ["formattedAddress", "location"] });
  session = null;
  return place.location ? { address: place.formattedAddress, lat: place.location.lat(), lng: place.location.lng() } : null;
};
