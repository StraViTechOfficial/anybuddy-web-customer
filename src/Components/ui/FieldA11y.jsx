"use client";
import { useEffect } from "react";

// Form accessibility for the whole site, so every form gets it without changing each field:
// - A field with a message under it is marked aria-invalid and points to the message (aria-describedby), and the
//   message is announced (role="alert").
// - After the customer presses a form's button with mistakes, the cursor moves to the first wrong field.
export default function FieldA11y() {
  useEffect(() => {
    let n = 0;
    const sync = () => {
      document.querySelectorAll("input[data-ab-err], select[data-ab-err], textarea[data-ab-err], [role=combobox][data-ab-err]").forEach((f) => {
        const msg = document.getElementById(f.dataset.abErr);
        if (!msg || !msg.isConnected) {
          f.removeAttribute("aria-invalid");
          f.removeAttribute("aria-describedby");
          delete f.dataset.abErr;
        }
      });
      document.querySelectorAll(".ab-error").forEach((msg) => {
        const box = msg.closest(".ab-field, .inputStyle, .mb-4, fieldset, .ab-check") || msg.parentElement;
        const field = box?.querySelector("input:not([type=hidden]), select, textarea, [role=combobox]");
        if (!field) return;
        if (!msg.id) msg.id = `ab-err-${++n}`;
        if (!msg.getAttribute("role")) msg.setAttribute("role", "alert");
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", msg.id);
        field.dataset.abErr = msg.id;
      });
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { childList: true, subtree: true });
    const onSubmit = () => setTimeout(() => document.querySelector('[aria-invalid="true"]:not([disabled])')?.focus(), 60);
    document.addEventListener("submit", onSubmit, true);
    sync();
    return () => {
      mo.disconnect();
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);
  return null;
}
