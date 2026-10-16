"use client";
import Icon from "@/Components/ui/Icon";
import { useEffect, useId, useRef } from "react";
import LoginPage from "./Login/LoginPage";
import { setOverlayOpen } from "@/Components/home/motion";
import "./style.css";

// On laptops, "Log in" in the header opens this pop-up over the current page (the Airbnb and Etsy pattern). It is the
// same form as /login. Sign-up and forgot password are longer, so their links open their own pages. Phones and every
// redirect (protected pages, email links) still use /login. A native <dialog> closes on Esc, keeps focus inside and
// makes the page behind it inert. After a successful login the page reloads in place, so the header and data show the
// signed-in state.
export default function LoginModal({ onClose }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    d.showModal();
    document.documentElement.style.overflow = "hidden"; // Stop the page behind the pop-up from scrolling.
    setOverlayOpen(true); // Also freeze anything that moves behind it.
    return () => {
      document.documentElement.style.overflow = "";
      setOverlayOpen(false);
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="ab-login-modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()} // A click on the dimmed area closes it.
    >
      <div className="ab-auth ab-auth--split ab-auth--center ab-login-modal__frame">
        <div className="ab-auth__card">
          {/* The brand header: the same navy band (dots and an amber edge) as the login page and the footer. */}
          <div className="ab-login-modal__band" aria-hidden="true" />
          <button type="button" className="ab-login-modal__x" onClick={() => ref.current.close()} aria-label="Close">
            <Icon name="x" size={18} />
          </button>
          <LoginPage page="login" titleId={titleId} onLoggedIn={() => window.location.reload()} />
        </div>
      </div>
    </dialog>
  );
}
