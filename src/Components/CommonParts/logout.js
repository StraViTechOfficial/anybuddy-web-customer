"use client";
import { logoutApi } from "@/api/setting";
import { FMC_TOKEN, TOKEN_NAME, TOKEN_NAME_REG } from "@/Until";
import { saveLocation } from "@/Until/searchLocation";
import Cookies from "@/Until/cookies";
import { signOut } from "next-auth/react";

// One-click log out, from the account menu or the profile sidebar. No confirmation page: logging out is undone by
// logging back in, and confirmations are for destructive actions (Airbnb, Urban Company do the same).
// The browser session is always cleared, even when the server call fails (an expired token used to keep you signed in).
// A full load of Home, not a client push: it also drops the profile and bookings held in memory (zustand store).
export async function logOut() {
  await logoutApi().catch(() => null); // best effort: the server forgets this device's push token
  [TOKEN_NAME, TOKEN_NAME_REG, FMC_TOKEN, "path", "tabShow"].forEach((c) => Cookies.remove(c));
  saveLocation(null); // the home ZIP filled from the profile must not stay for the next person on this computer
  await signOut({ redirect: false }).catch(() => null); // Google / Apple session, if one exists
  window.location.assign("/");
}
