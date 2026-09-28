"use client";
import Icon from "@/Components/ui/Icon";
import Loader from "@/Components/Loader/Loader";
import MobileInput from "@/Components/MobileInput/MobileInput";
import { pageAfterLogin, TOKEN_NAME, TOKEN_NAME_REG } from "@/Until";
import { MobileRequired, OTPRequired, showError } from "@/Until/ValidationError";
import { LoginPhoneApi, OTPVerificationApi } from "@/api/setting";
import { useFormik } from "formik";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OTPInput from "react-otp-input";
import * as Yup from "yup";
import "../FormStyle.css";
import { requestForToken } from "@/app/firebase";

function MobileLogin(props) {
  const [loading, setloading] = useState(false);
  const [loading1, setloading1] = useState(false);
  const { push } = useRouter();


  const initialValues = {
    countryCode: "+1",
    mobile: "",
    otp: "",
    OTPshow: false,
    terms: false,
  };
  // Server answers (wrong password, expired code…) show inline above the button, not as a pop-up.
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState(""); // "We already sent you a code..." (no new code went out)

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      mobile: MobileRequired,
      otp: Yup.string().when("OTPshow", { is: true, then: () => OTPRequired }),
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setFormError("");
      setloading(true);
      const payload = {
        loginOtp: values.otp,
      };

      if (values.OTPshow) {
        OTPVerificationApi(payload).then((res) => {
          if (res?.status === 1) {
            Cookies.remove(TOKEN_NAME_REG);
            Cookies.set(TOKEN_NAME, res?.data?.token);
            props.onLoggedIn ? props.onLoggedIn() : push(pageAfterLogin(Cookies)); // pop-up: stay on this page
            setloading(false);
            (async () => {
              try {
                const registration = await navigator.serviceWorker.ready;
                requestForToken(registration); // <-- FCM token save hoga
              } catch (err) {
                console.error("Service worker not ready", err);
              }
            })();
          } else {
            setloading(false);
            setFormError(res?.message || "Something went wrong. Please try again.");
          }
        });
      } else {
        getOtp();
        setloading(false);
      }
    },
  });

  const getOtp = () => {
    setloading1(true);
    LoginPhoneApi({
      phone: formik.values.mobile,
      countryCode: formik.values.countryCode,
      loginType: 4,
    }).then((res) => {
      if (res?.status === 1) {
        formik.setFieldValue("OTPshow", true);
        Cookies.set(TOKEN_NAME_REG, res?.data?.token);
        setloading1(false);
        // One live code per account: the server says how long the code already sent is still valid.
        setSeconds(res?.data?.codeValidFor || 600);
        setNotice(res?.data?.codeValidFor && res.data.codeValidFor < 600 ? res.message : "");
      } else {
        setloading1(false);
        formik.setFieldValue("OTPshow", false);
        setFormError(res?.message || "Something went wrong. Please try again.");
      }
    });
  };

  const [seconds, setSeconds] = useState(0);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

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

  const { onCodeStep } = props;
  useEffect(() => onCodeStep?.(!!formik.values.OTPshow), [formik.values.OTPshow, onCodeStep]);

  // All 6 digits in (typed or pasted): verify straight away - no extra click. The button stays for keyboards and retries.
  useEffect(() => {
    if (formik.values.OTPshow && formik.values.otp.length === 6 && !loading) formik.submitForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.otp]);

  return (
    <>
      {/* Phone log in (C3): 1) number + Send code  2) 6-digit code + Log in  3) Resend when the timer ends.
          One primary button at a time, no second button inside the field. */}
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="ab-field">
          <div className="ab-label-row">
            <label htmlFor="ab-login-phone" className="ab-label">Phone number</label>
            {formik.values.OTPshow && (
              <button
                type="button"
                className="ab-link ab-link--sm ab-linkbtn"
                onClick={() => {
                  formik.setFieldValue("OTPshow", false);
                  formik.setFieldValue("otp", "");
                  setSeconds(0);
                  setFormError("");
                }}
              >
                Change number
              </button>
            )}
          </div>
          <div className="inputStyle ab-phone">
            <MobileInput
              mobile="mobile"
              inputId="ab-login-phone"
              countryCode="countryCode"
              formik={formik}
              inputClass="form-control"
              value={`${formik.values.countryCode} ${formik.values.mobile}`}
              disabled={formik.values.OTPshow}
            />
          </div>
          {showError(formik, "mobile") && (
            <div className="ab-error" role="alert">{formik.errors.mobile}</div>
          )}
        </div>

        {formik.values.OTPshow && (
          <div className="ab-field ab-otp-step">
            {/* Timer / Resend on the label's row (like "Change number" above), so the step stays one screen tall. */}
            <div className="ab-label-row">
              <label className="ab-label">Enter the 6-digit code we texted you</label>
              {seconds > 0 ? (
                <span className="ab-otp-step__timer ab-num">Expires in {minutes}:{String(remainingSeconds).padStart(2, "0")}</span>
              ) : (
                <button type="button" className="ab-link ab-link--sm ab-linkbtn" onClick={getOtp} disabled={loading1}>
                  Resend code
                </button>
              )}
            </div>
            <OTPInput
              containerStyle="passcode-wrapper justify-content-start gap-2"
              value={formik.values.otp}
              onChange={(val) => formik.setFieldValue("otp", val)}
              inputStyle={"otpInputs"}
              numInputs={6}
              keyboardType={"number"}
              shouldAutoFocus={true}
              inputType="tel"
              renderInput={(p, i) => <input {...p} aria-label={`Digit ${i + 1} of 6`} autoComplete="one-time-code" inputMode="numeric" />}
            />
            {showError(formik, "otp") && (
              <div className="ab-error" role="alert">{formik.errors.otp}</div>
            )}
            {notice && <p className="ab-otp-notice" role="status">{notice}</p>}
          </div>
        )}

        {formError && (
          <div className="ab-form-alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{formError}</span>
          </div>
        )}
        <button
          type="submit"
          className="ab-btn ab-btn--primary ab-btn--lg ab-btn--block"
          aria-busy={loading || loading1}
          disabled={loading || loading1}
        >
          {loading || loading1 ? <Loader color="#fff" /> : formik.values.OTPshow ? "Log in" : "Send code"}
        </button>
      </form>
    </>
  );
}

export default MobileLogin;
