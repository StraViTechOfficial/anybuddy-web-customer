"use client";
import { VerifyEmailApi } from "@/api/setting";
import "@/Components/Forms/(AuthForm)/authfields.css";
import Icon from "@/Components/ui/Icon";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// The link in the "Confirm your email" message lands here (?token=...). It works signed in or out, on any device.
export default function VerifyEmail() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState({ status: "checking" });
  const sent = useRef(false); // React's development mode runs effects twice, and the token works only once.

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    if (!token) return setState({ status: "failed", message: "This link is incomplete. Open it again from the email." });
    VerifyEmailApi({ token }).then((res) =>
      setState(res?.status === 1 ? { status: "done", email: res.data?.email } : { status: "failed", message: res?.message || "Something went wrong. Try the link again." })
    );
  }, [token]);

  const done = state.status === "done";
  return (
    <div className="ab-auth__head" aria-live="polite">
      <span className="ab-step-icon" aria-hidden="true">
        <Icon name={done ? "checkCircle" : state.status === "failed" ? "alert" : "mail"} size={26} />
      </span>
      <h1>{done ? "Email confirmed" : state.status === "failed" ? "Link not valid" : "Confirming your email"}</h1>
      <p>
        {done ? (
          <>{state.email ? <strong>{state.email}</strong> : "Your email"} is confirmed. Booking updates and receipts will go there.</>
        ) : state.status === "failed" ? (
          state.message
        ) : (
          "One moment."
        )}
      </p>
      {state.status !== "checking" && (
        <Link href="/" className="ab-btn ab-btn--primary" style={{ marginTop: 16 }}>
          Go to Any-Buddy
        </Link>
      )}
    </div>
  );
}
