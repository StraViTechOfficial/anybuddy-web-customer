"use client";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

// A cookie value for what the page shows. Read after the page loads: the server can't see the browser's cookies, so
// reading it during render made the server and browser HTML differ (React hydration error).
export function useCookie(name) {
  const [value, setValue] = useState();
  useEffect(() => setValue(Cookies.get(name)), [name]);
  return value;
}
