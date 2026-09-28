"use client";
import Icon from "@/Components/ui/Icon";
import Loader from "@/Components/Loader/Loader";
import { OTP_FOR, pageAfterLogin, TOKEN_NAME, TOKEN_NAME_REG } from "@/Until";
import { EmailValidation, PasswordRequired, showError } from "@/Until/ValidationError";
import { forgotPasswordApi, LoginApi, OTPVerificationApi } from "@/api/setting";
import { requestForToken } from "@/app/firebase";
import { useFormik } from "formik";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OTPInput from "react-otp-input";
import { toast } from "react-toastify";
import * as Yup from "yup";
import "../FormStyle.css";

function LoginForm(props) {
  const [loading, setloading] = useState(false);
  const { push } = useRouter();

  const initialValues = {
    email: "",
    password: "",
    toggle: false,
    terms: false,
    otp: "",
    OTPshow: false,
  };
  // Server answers (wrong password, expired code…) show inline above the button, not as a pop-up.
  const [formError, setFormError] = useState("");

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      email: EmailValidation,
      password: props.page !== "forgot" && PasswordRequired,
      // terms: props.page !== "forgot" && BooleanValidation,
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setFormError("");
      setloading(true);
      const payload = {
        email: values.email,
        password: values.password,
        loginType: 1,
      };

      if (props.page === "forgot") {
        forgotPasswordApi({ email: values.email }).then((res) => {
          if (res?.status === 1) {
            toast.success(res.message);
            Cookies.set(TOKEN_NAME_REG, res?.data?.token);

            Cookies.set("email", values.email);
            Cookies.remove(OTP_FOR);
            push("/otp-verify");
            setloading(false);
          } else {
            setloading(false);
            setFormError(res?.message || "Something went wrong. Please try again.");
          }
        });
      } else {
        if (values.OTPshow) {
          OTPVerificationApi({ otp: values.otp }).then((res) => {
            if (res?.status === 1) {
              toast.success(res.message);
              Cookies.set(TOKEN_NAME_REG, res?.data?.token);
              push(pageAfterLogin(Cookies));
              setloading(false);
            } else {
              setloading(false);
              setFormError(res?.message || "Something went wrong. Please try again.");
            }
          });
        } else {
          LoginApi(payload).then((res) => {
            if (res?.status === 1) {
              // if (!res?.data?.user_data?.firstName) {
              //   Cookies.set(TOKEN_NAME, res?.data?.token);
              //   formik.setFieldValue("OTPshow", true);
              // } else {
              //   Cookies.set(TOKEN_NAME, res?.data?.token);
              //   push("/");
              // }
              Cookies.set(TOKEN_NAME, res?.data?.token);
              Cookies.remove(TOKEN_NAME_REG);
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
            } else if (res?.data?.needsVerification) {
              // BUG-13: account not verified yet. The backend emailed a code; confirm it on the code screen.
              Cookies.set(TOKEN_NAME_REG, res.data.token);
              Cookies.set("email", values.email);
              Cookies.set(OTP_FOR, "login");
              // One live code per account: the code screen counts down the real time left, and says when no new
              // code was sent.
              Cookies.set("otpUntil", String(Date.now() + (res.data.codeValidFor || 600) * 1000));
              if (res.data.sentTo) Cookies.set("otpSentTo", res.data.sentTo); // "+1 ••• ••• 0101"
              if (res.data.codeValidFor && res.data.codeValidFor < 600) Cookies.set("otpNotice", res.message);
              setloading(false);
              // No toast here: from the pop-up it showed behind the dimmed backdrop and vanished as the page changed.
              // The code screen itself says "Check your email - enter the 6-digit code we sent to ...".
              push("/otp-verify");
            } else {
              setloading(false);
              setFormError(res?.message || "Something went wrong. Please try again.");
            }
          });
        }
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit} noValidate>
        <label htmlFor="ab-email" className="ab-label">Email address</label>
        <div className="inputStyle ab-field mt-2">
          <input
            id="ab-email"
            type="email"
            autoComplete="email"
            className="form-control"
            placeholder="you@example.com"
            {...formik.getFieldProps("email")}
          />

          {showError(formik, "email") && (
            <div className="ab-error" role="alert">{formik.errors.email}</div>
          )}
        </div>
        {props.page === "login" && (
          <>
            {/* "Forgot password" sits on the label row (as on Stripe): one line less, so the card fits a laptop screen. */}
            <div className="ab-label-row">
              <label htmlFor="ab-password" className="ab-label">Password</label>
              <Link href={"/forgot-password"} className="ab-link ab-link--sm">
                Forgot password
              </Link>
            </div>
            <div className="inputStyle ab-field mt-2 mb-2">
              <input
                id="ab-password"
                type={formik.values.toggle ? "text" : "password"}
                autoComplete="current-password"
                className="form-control"
                placeholder="Enter your password"
                {...formik.getFieldProps("password")}
              />

              <button
                type="button"
                aria-label={formik.values.toggle ? "Hide password" : "Show password"}
                className={
                  formik.values.toggle
                    ? "pass-hide field-icon toggle-password"
                    : "pass-view field-icon toggle-password"
                }
                onClick={(e) => {
                  e.preventDefault();
                  formik.setFormikState((prevState) => {
                    return {
                      ...prevState,
                      values: {
                        ...prevState.values,
                        toggle: !prevState.values.toggle,
                      },
                    };
                  });
                }}
              ></button>
              {showError(formik, "password") && (
                <div className="ab-error" role="alert">{formik.errors.password}</div>
              )}
            </div>
          </>
        )}
        {formik.values.OTPshow && (
          <div className="col-sm-12 col-md-12 col-lg-12 mb-2">
            <h6 className="">Enter OTP</h6>
            <div className="position-relative">
              <OTPInput
                containerStyle="passcode-wrapper justify-content-start gap-2"
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
                renderInput={(props) => <input {...props} />}
              />

              {showError(formik, "otp") && (
                <div className="text-danger">{formik.errors.otp}</div>
              )}
            </div>
          </div>
        )}
        {/* {props.page === "login" && (
          <div className="col-sm-12 col-md-12 col-lg-12 mb-4 text-start">
            <label>
              <input
                type="checkbox"
                checked={formik.values.terms}
                className="d-none"
                onChange={(e) => {
                  formik.setFieldValue("terms", e.target.checked);
                }}
              />
              <Image
                src={`/assets/images/${
                  formik.values.terms ? "check_box" : "Uncheck"
                }.png`}
                alt=""
                width={15}
                height={15}
                className="object-fit-contain"
              />{" "}
              By Signing up you agree to our{" "}
              <Link
                href={"/terms-conditions"}
                target="_blank"
                className="textColor fw-bold text-decoration-underline"
              >
                Terms & conditions
              </Link>{" "}
              &{" "}
              <Link
                href={"/privacy-policy"}
                target="_blank"
                className="textColor fw-bold text-decoration-underline"
              >
                Privacy policy
              </Link>
              .
            </label>
            {showError(formik, "terms") && (
              <div className="text-danger"> {formik.errors.terms}</div>
            )}
          </div>
        )} */}
        {formError && (
          <div className="ab-form-alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{formError}</span>
          </div>
        )}
        <div className="mb-2">
          <button
            type="submit"
            className="ab-btn ab-btn--primary ab-btn--lg ab-btn--block"
            aria-busy={loading}
          >
            {loading ? (
              <Loader color="#fff" />
            ) : (
              `${
                props.page === "forgot"
                  ? "Continue"
                  : formik.values.OTPshow
                    ? "Verify"
                    : "Log in"
              }`
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default LoginForm;
