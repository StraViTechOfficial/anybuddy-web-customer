"use client";
import { logoutApi } from "@/api/setting";
import { FMC_TOKEN } from "@/Until";
import { saveLocation } from "@/Until/searchLocation";
import Cookies from "@/Until/cookies";
import { signOut } from "next-auth/react";

// Logs out in one click, from the account menu or the profile sidebar. There is no confirmation page, because logging
// out is undone by logging back in, and confirmations are for destructive actions (Airbnb and Urban Company do the same).
// The browser session is always cleared, even when the server call fails. An expired token used to keep people signed in.
// It then does a full load of Home rather than a client-side navigation, so the profile and bookings held in memory
// (the zustand store) are dropped too.
export async function logOut() {
  await logoutApi().catch(() => null); // Best effort: ask the server to forget this device's push token. The proxy clears the login cookies either way.
  [FMC_TOKEN, "path", "tabShow"].forEach((c) => Cookies.remove(c));
  saveLocation(null); // The home ZIP filled in from the profile must not stay for the next person on this computer.
  await signOut({ redirect: false }).catch(() => null); // End the Google or Apple session, if there is one.
  window.location.assign("/");
}
