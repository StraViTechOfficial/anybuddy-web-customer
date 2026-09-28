"use client";
import { ResendEmailLinkApi } from "@/api/setting";
import Icon from "@/Components/ui/Icon";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Signed in with an email that is not confirmed yet: a small reminder at the bottom of the screen with a Resend link.
// Not a blocker (the phone is verified); the customer can close it until the next visit.
const KEY = "ab-email-reminder-closed";
export default function EmailReminder({ email }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try { setOpen(sessionStorage.getItem(KEY) !== "1"); } catch { setOpen(true); }
  }, []);
  if (!open) return null;

  const close = () => {
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    setOpen(false);
  };
  const resend = async () => {
    setBusy(true);
    const res = await ResendEmailLinkApi();
    setBusy(false);
    if (res?.status === 1) toast.success(res.message);
    else toast.error(res?.message || "We couldn't send the link. Try again.");
  };

  return (
    <aside className="ab-email-reminder" role="status">
      <Icon name="mail" size={18} />
      <p>
        Confirm your email{email ? <> (<strong>{email}</strong>)</> : null} with the link we sent.{" "}
        <button type="button" onClick={resend} disabled={busy}>{busy ? "Sending…" : "Send a new link"}</button>
      </p>
      <button type="button" className="ab-email-reminder__x" onClick={close} aria-label="Close reminder">
        <Icon name="x" size={16} />
      </button>
    </aside>
  );
}
