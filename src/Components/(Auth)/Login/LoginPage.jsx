"use client";
import { LoginApi } from "@/api/setting";
import { forgetSession } from "@/api";
import LoginForm from "@/Components/Forms/(AuthForm)/LoginForm";
import MobileLogin from "@/Components/Forms/(AuthForm)/MobileLogin";
import { pageAfterLogin } from "@/Until";
import Cookies from "@/Until/cookies";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import SocialButtons from "./SocialButtons";

function LoginPage(props) {
  const [codeStep, setCodeStep] = useState(false);
  const [ForLogin, setForLogin] = useState("email"); // Email comes first, because it is the usual way to sign in on a US site.
  // The box glides to the open form's own height (250 ms), so the shorter phone form leaves no empty space and
  // nothing jumps. It follows the form as it grows (code boxes, messages).
  const panesRef = useRef(null);
  const [paneH, setPaneH] = useState(0);
  useEffect(() => {
    const pane = panesRef.current?.querySelector(`[data-pane="${ForLogin}"]`);
    if (!pane) return;
    const measure = () => setPaneH(pane.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(pane);
    return () => ro.disconnect();
  }, [ForLogin]);
  const { push } = useRouter();
  // Google and Apple leave the site and come back to /login, which finishes the sign-in (in the effect below) and then
  // goes to the page in the "path" cookie (pageAfterLogin). From the pop-up, that is the page it was opened on, so the
  // customer ends up where they were, signed in. The pop-up itself cannot survive the round trip.
  const socialSignIn = (provider) => {
    if (props.onLoggedIn) Cookies.set("path", window.location.pathname + window.location.search);
    signIn(provider, { callbackUrl: "/login" });
  };
  const { data: session } = useSession();


  // Opening the login page signs out an old session, once. It used to run on every render, so the token that a
  // successful login had just saved was deleted again before the page changed, and you landed on Home signed out.
  useEffect(() => {
    forgetSession();
  }, []);

  const payload = {
    loginType:
      session?.user?.provider === "google"
        ? 2
        : session?.user?.provider === "apple"
          ? 5
          : 3,
    email: session?.user?.email,
    idToken: session?.user?.idToken,
  };

  useEffect(() => {
    if (session?.user?.idToken) {
      LoginApi(payload).then((res) => {
        // The provider's session has done its job, because our own token is the session now. Dropping it stops a later
        // visit to /login from replaying an expired ID token.
        signOut({ redirect: false }).catch(() => null);
        if (res?.status === 1 && res?.data?.needsProfile) {
          // The first time with Google or Apple, the account still needs a verified phone and the Terms tick, as in an email
          // sign-up. The token only allows finishing sign-up, and the name and email are shown there for an hour at most.
          Cookies.set("socialName", res.data.firstName || "", { expires: 1 / 24 });
          Cookies.set("socialEmail", res.data.email || "", { expires: 1 / 24 });
          push("/complete-signup"); // Keep the "path" cookie for after step 2.
        } else if (res?.status === 1) {
          toast.success(res.message);
          push(pageAfterLogin(Cookies));

        } else {
          toast.error(res.message);
        }
      });
    }
  }, [session?.user?.idToken]); // Check idToken, not googleId. Apple has no googleId, so this never ran for Apple.

  return (
    <>
      <div className="ab-auth__head">
        <h1 id={props.titleId}>Log in</h1>
        <p>Welcome back to Any-Buddy.</p>
      </div>

      <div className="ab-seg" role="tablist" aria-label="Log in with">
        <button
          type="button"
          role="tab"
          aria-selected={ForLogin === "email"}
          className="ab-seg__btn"
          onClick={() => setForLogin("email")}
        >
          Email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={ForLogin === "mobile"}
          className="ab-seg__btn"
          onClick={() => setForLogin("mobile")}
        >
          Phone number
        </button>
      </div>

      {/* Both forms share one grid cell and cross-fade, so switching between Email and Phone never moves the page. */}
      <div className="ab-auth__form ab-auth__panes" ref={panesRef} style={{ height: paneH || undefined }}>
        <div className={`ab-auth__pane${ForLogin === "email" ? " is-on" : ""}`} data-pane="email" role="tabpanel" inert={ForLogin !== "email"}>
          <LoginForm page={props.page} onLoggedIn={props.onLoggedIn} />
        </div>
        <div className={`ab-auth__pane${ForLogin === "mobile" ? " is-on" : ""}`} data-pane="mobile" role="tabpanel" inert={ForLogin !== "mobile"}>
          <MobileLogin onLoggedIn={props.onLoggedIn} onCodeStep={setCodeStep} />
        </div>
      </div>

      {/* On the phone tab's code step the customer has chosen how to sign in, so the Google and Apple buttons are
          hidden and the card stays one screen tall. "Change number" or the Email tab brings them back. */}
      {!(ForLogin === "mobile" && codeStep) && <SocialButtons onPick={socialSignIn} />}

      <p className="ab-auth__switch">
        New to Any-Buddy?{" "}
        <Link href={"/signup"} className="ab-link">
          Create an account
        </Link>
      </p>
    </>
  );
}

export default LoginPage;
