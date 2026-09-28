"use client";
import Icon from "@/Components/ui/Icon";
import { logoImg } from "@/Until/ImageExport";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import LoginPage from "./Login/LoginPage";
import OTPVerify from "./OTPVerify/OTPVerify";
import ResetChangePassword from "./ResetChangePassword/ResetChangePassword";
import SetProfile from "./SetProfile/SetProfile";
import VerifyEmail from "./VerifyEmail/VerifyEmail";
import { Suspense } from "react";
import "@/Components/Header/header.css";
import "./style.css";

// Auth frame (owner 27 Sep): one centred card (Airbnb / Thumbtack / Stripe standard). Background as on Stripe's sign-in:
// white top with the full-colour logo, a slim angled brand-colour band fixed along the bottom of the page (same height
// on every step, like the footer), small legal links on the band. No pictures.
function AuthLayout(props) {
  const { back, push } = useRouter();
  const wide = props.page === "profile" || props.page === "signup";

  return (
    <div className="ab-auth ab-auth--split ab-auth--center">
      <div className="ab-auth__band" aria-hidden="true" />
      {/* Same white pill header as every other page (Header.jsx / header.css), so moving from the site to log in
          feels like one product. Only the logo and Back: no menu links, the form keeps the focus. */}
      <header className="ab-hd has-pill ab-hd--auth">
        <div className="ab-hd__card">
          <div className="ab-hd__row">
            <Link href="/" className="ab-hd__brand" aria-label="Any-Buddy home">
              <Image src={logoImg} alt="" width={56} height={50} priority />
              <span>Any-Buddy</span>
            </Link>
            <button type="button" className="ab-auth__back" onClick={() => (history.length > 1 ? back() : push("/"))}>
              <Icon name="arrowLeft" size={18} /> {props.page === "login" ? "Back to site" : "Back"}
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="ab-auth__main">
        <div className={`ab-auth__card${wide ? " ab-auth__card--wide" : ""}`}>
          {props.page === "login" ? (
            <LoginPage page={props.page} />
          ) : props.page === "forgot" ? (
            <ForgotPassword page={props.page} />
          ) : props.page === "otp" ? (
            <OTPVerify page={props.page} />
          ) : props.page === "reset" ? (
            <ResetChangePassword page={props.page} />
          ) : props.page === "profile" || props.page === "signup" || props.page === "social" ? (
            <SetProfile page={props.page} />
          ) : props.page === "verify-email" ? (
            <Suspense>
              <VerifyEmail />
            </Suspense>
          ) : null}
          {props.page === "signup" && (
            <p className="ab-auth__switch">
              Already have an account?{" "}
              <Link href="/login" className="ab-link">
                Log in
              </Link>
            </p>
          )}
        </div>
      </main>
      <footer className="ab-auth__legal">
        <span>© {new Date().getFullYear()} Any-Buddy</span>
        <Link href="/privacy-policy">Privacy</Link>
        <Link href="/terms-conditions">Terms</Link>
        <Link href="/support">Help</Link>
      </footer>
    </div>
  );
}

export default AuthLayout;
