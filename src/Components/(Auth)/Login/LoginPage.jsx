"use client";
import { LoginApi } from "@/api/setting";
import { requestForToken } from "@/app/firebase";
import LoginForm from "@/Components/Forms/(AuthForm)/LoginForm";
import MobileLogin from "@/Components/Forms/(AuthForm)/MobileLogin";
import { pageAfterLogin, TOKEN_NAME, TOKEN_NAME_REG } from "@/Until";
import Cookies from "js-cookie";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import SocialButtons from "./SocialButtons";

function LoginPage(props) {
  const [codeStep, setCodeStep] = useState(false);
  const [ForLogin, setForLogin] = useState("email"); // email first: the usual way to sign in on a US site
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
  // Google / Apple leave the site and come back to /login, which finishes the sign-in (effect below) and goes on to
  // the "path" cookie (pageAfterLogin). From the pop-up, that is the page it was opened on - so the customer ends
  // up where they were, signed in (the pop-up itself cannot survive the round trip).
  const socialSignIn = (provider) => {
    if (props.onLoggedIn) Cookies.set("path", window.location.pathname + window.location.search);
    signIn(provider, { callbackUrl: "/login" });
  };
  const { data: session } = useSession();


  // Opening the log-in page signs out an old session, once. (It ran on every render before, so the token a
  // successful login had just saved was deleted again before the page changed: you landed on Home signed out.)
  useEffect(() => {
    Cookies.remove(TOKEN_NAME);
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
    if (session?.user?.provider) {
      LoginApi(payload).then((res) => {
        if (res?.status === 1 && res?.data?.needsProfile) {
          // First time with Google / Apple: the account still needs a verified phone and the Terms tick (like email
          // sign-up). The token only allows finishing sign-up; name / email are shown there for an hour at most.
          Cookies.set(TOKEN_NAME_REG, res.data.token);
          Cookies.set("socialName", res.data.firstName || "", { expires: 1 / 24 });
          Cookies.set("socialEmail", res.data.email || "", { expires: 1 / 24 });
          push("/complete-signup"); // the "path" cookie stays for after step 2
        } else if (res?.status === 1) {
          toast.success(res.message);
          Cookies.set(TOKEN_NAME, res?.data?.token);
          Cookies.remove(TOKEN_NAME_REG);
          push(pageAfterLogin(Cookies));

          (async () => {
            try {
              const registration = await navigator.serviceWorker.ready;
              requestForToken(registration); // <-- FCM token save hoga
            } catch (err) {
              console.error("Service worker not ready", err);
            }
          })();
        } else {
          toast.error(res.message);
        }
      });
    }
  }, [session?.user?.googleId]);

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

      {/* Both forms share one grid cell and cross-fade, so switching Email / Phone never moves the page. */}
      <div className="ab-auth__form ab-auth__panes" ref={panesRef} style={{ height: paneH || undefined }}>
        <div className={`ab-auth__pane${ForLogin === "email" ? " is-on" : ""}`} data-pane="email" role="tabpanel" inert={ForLogin !== "email"}>
          <LoginForm page={props.page} onLoggedIn={props.onLoggedIn} />
        </div>
        <div className={`ab-auth__pane${ForLogin === "mobile" ? " is-on" : ""}`} data-pane="mobile" role="tabpanel" inert={ForLogin !== "mobile"}>
          <MobileLogin onLoggedIn={props.onLoggedIn} onCodeStep={setCodeStep} />
        </div>
      </div>

      {/* Code step on the phone tab: the customer has picked their way in, so Google / Apple step aside (and the card
          stays one screen tall). "Change number" or the Email tab brings them back. */}
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
