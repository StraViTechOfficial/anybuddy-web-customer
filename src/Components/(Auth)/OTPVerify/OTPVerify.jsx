"use client";
import OTPVerifyForm from "@/Components/Forms/(AuthForm)/OTPVerifyForm";
import "@/Components/Forms/(AuthForm)/authfields.css";
import Icon from "@/Components/ui/Icon";
import { OTP_FOR } from "@/Until";
import { useCookie } from "@/Until/useCookie";

// Log-in of an account that is not verified yet: the code went to the phone (contract C5).
// Forgot password: to the email if it is confirmed, otherwise the phone - the page can't say which (it must not
// reveal whether an account exists), so it names both.
function OTPVerify(props) {
  const purpose = useCookie(OTP_FOR);
  const sentTo = useCookie("otpSentTo");
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
            <>We sent a 6-digit code to the email or phone number on your account.</>
          )}
        </p>
      </div>
      <OTPVerifyForm PageName={"forgot password"} />
    </>
  );
}

export default OTPVerify;
