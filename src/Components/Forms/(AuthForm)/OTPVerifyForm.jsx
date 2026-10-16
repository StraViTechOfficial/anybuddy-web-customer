"use client";
import { useFormik } from "formik";
import Image from "next/image";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import OtpInput from "react-otp-input";
import Cookies from "@/Until/cookies";
import { useRouter } from "next/navigation";
import Loader from "@/Components/Loader/Loader";
import {
  forgotPasswordApi,
  OTPVerificationApi,
  ResendOTPApi,
} from "@/api/setting";
import { toast } from "react-toastify";
import { OTP_FOR, pageAfterLogin, TOKEN_NAME, TOKEN_NAME_REG } from "@/Until";
import { OTPRequired, showError } from "@/Until/ValidationError";
import "./authfields.css";

function OTPVerifyForm(props) {
  const { push } = useRouter();
  const [loading, setloading] = useState(false);
  const email = Cookies.get("email");

  // Time left on the code already sent (set by the login form); a fresh code otherwise. Read once, then cleared.
  const [seconds, setSeconds] = useState(600);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const until = Number(Cookies.get("otpUntil"));
    if (until) setSeconds(Math.max(0, Math.round((until - Date.now()) / 1000)));
    setNotice(Cookies.get("otpNotice") || "");
    Cookies.remove("otpUntil");
    Cookies.remove("otpNotice");
  }, []);
  // Whole minutes, never seconds (owner, 29 Sep); rounded up so it never reads "0 min" early.
  const minutesLeft = Math.ceil(seconds / 60);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [seconds]);
  // The "already sent" message is about the code that just ran out: it goes when the timer does.
  useEffect(() => {
    if (seconds === 0) setNotice("");
  }, [seconds]);

  const resendCode = () => {
    ResendOTPApi({
      email: email,
      // Forgot password: same channel as the first code (email if confirmed, else phone). Other flows: the phone.
      ...(Cookies.get(OTP_FOR) !== "login" && { purpose: "forgot" }),
    }).then((res) => {
      if (res?.status === 1) {
        toast.success(res?.message);
        setNotice("");
        setSeconds(res?.data?.codeValidFor || 600); // a new code: its full time
      } else if (res?.data?.codeValidFor) {
        // The last code is still valid: nothing new was sent; show how long it still works.
        setSeconds(res.data.codeValidFor);
        setNotice(res.message);
      } else {
        toast.error(res?.message);
      }
    });
  };
  const initialValues = {
    type: props.Type,
    otp: "",
  };
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      otp: OTPRequired,
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setloading(true);

      const payload = {
        loginOtp: values.otp,
      };

      OTPVerificationApi(payload).then((res) => {
        if (res?.status === 1) {
          toast.success(res.message);
          if (Cookies.get(OTP_FOR) === "login") {
            // BUG-13: code confirmed after an unverified login; this is the full login token.
            Cookies.set(TOKEN_NAME, res?.data?.token);
            Cookies.remove(TOKEN_NAME_REG);
            Cookies.remove(OTP_FOR);
            push(pageAfterLogin(Cookies));
          } else {
            Cookies.set(TOKEN_NAME_REG, res?.data?.token);
            push("/reset-password");
          }
          Cookies.remove("email");
          setloading(false);
        } else {
          setloading(false);
          toast.error(res.message);
        }
      });
    },
  });
  // All 6 digits in (typed or pasted): verify straight away - no extra click. The button stays for keyboards and retries.
  useEffect(() => {
    if (formik.values.otp.length === 6 && !loading) formik.submitForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.otp]);

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="ab-otp" role="group" aria-labelledby="ab-otp-label">
        {notice && <p className="ab-otp-notice" role="status">{notice}</p>}
        <span id="ab-otp-label" className="ab-label">
          Verification code
        </span>
        <OtpInput
          containerStyle="passcode-wrapper"
          value={formik.values.otp}
          onChange={(val) => {
            formik.setFieldValue("otp", val);
          }}
          inputStyle={"otpInputs"}
          numInputs={6}
          separator={<span> </span>}
          keyboardType={"number"}
          shouldAutoFocus={true}
          inputType="tel"
          renderInput={(p, i) => <input {...p} aria-label={`Digit ${i + 1} of 6`} autoComplete="one-time-code" inputMode="numeric" />}
        />

        {showError(formik, "otp") && (
          <div className="ab-error" role="alert">
            {formik.errors.otp}
          </div>
        )}
      </div>

      {seconds > 0 && (
        <p className="ab-otp__meta" aria-live="off">
          You can request a new code in{" "}
          <span className="ab-num">
            {minutesLeft} min
          </span>
        </p>
      )}

      <div className="ab-form-actions">
        <button
          type="submit"
          className="ab-btn ab-btn--primary ab-btn--lg ab-btn--block"
          aria-busy={loading}
        >
          {loading ? <Loader color="#fff" /> : "Verify code"}
        </button>
      </div>

      {seconds === 0 && (
        <div className="ab-otp__resend">
          <button
            type="button"
            className="ab-textbtn"
            onClick={resendCode}
          >
            Send a new code
          </button>
        </div>
      )}
    </form>
  );
}

export default OTPVerifyForm;
