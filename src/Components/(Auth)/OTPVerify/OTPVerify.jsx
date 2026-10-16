"use client";
import OTPVerifyForm from "@/Components/Forms/(AuthForm)/OTPVerifyForm";
import "@/Components/Forms/(AuthForm)/authfields.css";
import Icon from "@/Components/ui/Icon";
import { OTP_FOR } from "@/Until";
import { useCookie } from "@/Until/useCookie";

// Logging in to an account that is not verified yet sends the code to the phone.
// For forgot password it goes to the email if that is confirmed, otherwise to the phone. The page can't say which,
// because it must not reveal whether an account exists, so it names both.
function OTPVerify(props) {
  const purpose = useCookie(OTP_FOR);
  const sentTo = useCookie("otpSentTo");
  const email = useCookie("email");
  const byPhone = purpose === "login";
  return (
    <>
      <div className="ab-auth__head">
        <span className="ab-step-icon" aria-hidden="true">
          <Icon name={byPhone ? "phone" : "mail"} size={26} />
        </span>
        <h1>{byPhone ? "Check your phone" : "Enter your code"}</h1>
        <p>
          {byPhone ? (
            <>We sent a 6-digit code to {sentTo ? <strong>{sentTo}</strong> : "your phone"}.</>
          ) : (
            <>
              If an account exists for {email ? <strong>{email}</strong> : "that email"}, we&apos;ve sent a 6-digit code
              to its email or phone number. It can take a minute to arrive.
            </>
          )}
        </p>
      </div>
      <OTPVerifyForm PageName={"forgot password"} />
    </>
  );
}

export default OTPVerify;
