"use client";
import { RemoveBuddyApi, SaveBuddyApi, SavedBuddiesApi } from "@/api/setting";
import { TOKEN_NAME } from "@/Until";
import { useCookie } from "@/Until/useCookie";
import Icon from "@/Components/ui/Icon";
import Cookies from "@/Until/cookies";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./cards.css";

// Saved Buddies (favourites are pros, not services). One list-buddies call per page; a heart
// flips at once and flips back if the server says no. Guests log in first and come back to this page.
export function useSavedBuddies() {
  const { push } = useRouter();
  const token = useCookie(TOKEN_NAME);
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    if (!token) return;
    SavedBuddiesApi().then((res) => setIds(new Set((res?.data || []).map((b) => String(b.vendorId)))));
  }, [token]);

  const set = (id, on) =>
    setIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  const toggle = (vendorId) => {
    if (!Cookies.get(TOKEN_NAME)) {
      Cookies.set("path", window.location.pathname); // login returns here
      return push("/login");
    }
    const id = String(vendorId);
    const was = ids.has(id);
    set(id, !was);
    (was ? RemoveBuddyApi : SaveBuddyApi)({ vendorId: id }).then((res) => {
      if (res?.status === 1) return;
      set(id, was);
      toast.error(res?.message || "We couldn't update your Saved Buddies. Please try again.");
    });
  };

  return { isSaved: (vendorId) => ids.has(String(vendorId)), toggle };
}

export default function SaveBuddy({ saved, onClick, name }) {
  return (
    <button
      type="button"
      className={`ab-heart${saved ? " is-on" : ""}`}
      aria-pressed={!!saved}
      aria-label={`Save ${name || "this Buddy"}`}
      title={saved ? "Saved to your Buddies" : "Save this Buddy"}
      onClick={onClick}
    >
      <Icon name="heart" size={20} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
