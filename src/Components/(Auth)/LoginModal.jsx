"use client";
import Icon from "@/Components/ui/Icon";
import { useEffect, useId, useRef } from "react";
import LoginPage from "./Login/LoginPage";
import { setOverlayOpen } from "@/Components/home/motion";
import "./style.css";

// "Log in" from the header on laptops opens this pop-up over the current page (owner 27 Sep; Airbnb / Etsy pattern).
// Same form as /login. Sign-up and forgot-password are longer, so their links open their own pages; phones and every
// redirect (protected pages, email links) still use /login. Native <dialog>: Esc closes, focus stays inside, the page
// behind is inert. After a successful login the page reloads in place, so the header and data show the signed-in state.
export default function LoginModal({ onClose }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    d.showModal();
    document.documentElement.style.overflow = "hidden"; // no page scroll behind the pop-up
    setOverlayOpen(true); // and nothing moving behind it
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
      onClick={(e) => e.target === ref.current && ref.current.close()} // click on the dimmed area closes it
    >
      <div className="ab-auth ab-auth--split ab-auth--center ab-login-modal__frame">
        <div className="ab-auth__card">
          {/* Brand header: the same navy band (dots, amber edge) as the log-in page and the footer. */}
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
