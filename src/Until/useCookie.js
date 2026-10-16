"use client";
import Cookies from "@/Until/cookies";
import { useEffect, useState } from "react";

// Returns a cookie value for the page to show. It is read after the page loads, because the server can't see the
// browser's cookies. Reading it during render made the server and browser HTML differ (a React hydration error).
export function useCookie(name) {
  const [value, setValue] = useState();
  useEffect(() => setValue(Cookies.get(name)), [name]);
  return value;
}
