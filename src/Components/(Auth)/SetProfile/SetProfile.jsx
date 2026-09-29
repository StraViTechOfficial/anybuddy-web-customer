"use client";
import {
  LocationApi,
  OTPVerificationApi,
  RegisterApi,
  ResendOTPApi,
  SetProfileApi,
  SocialCompleteApi,
} from "@/api/setting";
import { useDataStore } from "@/api/store/store";
import "@/Components/Forms/FormStyle.css";
import "@/Components/Forms/(AuthForm)/authfields.css";
import Icon from "@/Components/ui/Icon";
import Link from "next/link";
import ImageUploadInput from "@/Components/ImageUploadInput/ImageUploadInput";
import Loader from "@/Components/Loader/Loader";
import MobileInput from "@/Components/MobileInput/MobileInput";
import { pageAfterLogin, TOKEN_NAME, TOKEN_NAME_REG } from "@/Until";
import { useCookie } from "@/Until/useCookie";
import { employeImg } from "@/Until/ImageExport";
import {
  CityRequired,
  CountryRequired,
  EmailValidation,
  FirstNameRequired,
  LastNameRequired,
  GenderRequired,
  MobileRequired,
  PasswordMatch,
  PasswordRequired,
  NewPassword,
  PostalCodeRequired,
  StateRequired,
  StreetRequired, showError } from "@/Until/ValidationError";
import { useFormik } from "formik";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OTPInput from "react-otp-input";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Select from "@/Components/ui/Select";
import SocialButtons from "../Login/SocialButtons";
import { signIn } from "next-auth/react";

const GENDERS = [
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
  { value: "3", label: "Other" },
];

function SetProfile(props) {
  const token = Cookies.get(TOKEN_NAME);
  const getProfile = useDataStore((store) => store.getProfile);
  const { fetchgetProfile } = useDataStore();

  const [OTPshow, setOTPshow] = useState(1);
  // "social": first Google / Apple sign-in (/complete-signup). Only phone + Terms; the name and email came from them.
  const isSocial = props.page === "social";
  const socialName = useCookie("socialName");
  const socialEmail = useCookie("socialEmail");
  const [sent, setSent] = useState(null); // social-complete reply: { sentTo, codeValidFor }
  // Step 2 right after the phone code: say that the confirm-email link went out (read once, after load).
  const [linkSentTo, setLinkSentTo] = useState("");
  useEffect(() => {
    setLinkSentTo(Cookies.get("emailLinkSent") || "");
    Cookies.remove("emailLinkSent");
  }, []);
  const email = Cookies.get("email");

  const [seconds, setSeconds] = useState(0);
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

  useEffect(() => {
    if (token && props.page !== "signup" && !getProfile?.firstName) {
      fetchgetProfile();
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const [loading, setloading] = useState(false);
  const { push } = useRouter();

  const [CountryList, setCountryList] = useState([]);
  const [StateList, setStateList] = useState([]);
  const [CityList, setCityList] = useState([]);

  const initialValues = {
    profile: token ? { url: getProfile?.logoUrl } || "" : "",
    firstName: token ? getProfile?.firstName || "" : "",
    lastName: token ? getProfile?.lastName || "" : "",
    countryCode: token ? getProfile?.countryCode || "" : "",
    mobile: token ? getProfile?.phone || "" : "",
    email: token ? getProfile?.email || "" : "",
    password: "",
    confirmPassword: "",
    toggle: false,
    toggle1: false,
    gender: token
      ? getProfile?.gender
        ? getProfile?.gender?.toString()
        : "" || ""
      : "",
    street: token ? getProfile?.address?.street || "" : "",
    city: token ? getProfile?.address?.city || "" : "",
    state: token ? getProfile?.address?.state || "" : "",
    country: (token && getProfile?.address?.country) || "United States", // US only
    postalCode: token ? getProfile?.postalCode || "" : "",
    term: false,
    otp: "",
  };
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      firstName: !isSocial && FirstNameRequired,
      email: !isSocial && EmailValidation,
      password: OTPshow === 1 && props.page === "signup" && NewPassword,
      confirmPassword:
        OTPshow === 1 && props.page === "signup" && PasswordMatch,
      lastName: OTPshow === 1 && props.page === "signup" && LastNameRequired,
      // L1 (18+) and L3/L20 (Terms, Privacy, e-communications): one explicit tick box at sign-up.
      term:
        OTPshow === 1 &&
        (props.page === "signup" || isSocial) &&
        Yup.boolean().oneOf([true], "Confirm you're 18 or older and agree to the Terms to continue."),
      mobile: OTPshow === 1 && (props.page === "signup" || isSocial) && MobileRequired,
      gender: OTPshow === 1 && props.page === "profile" && GenderRequired,
      street: OTPshow === 1 && props.page === "profile" && StreetRequired,
      city: OTPshow === 1 && props.page === "profile" && CityRequired,
      state: OTPshow === 1 && props.page === "profile" && StateRequired,
      country: OTPshow === 1 && props.page === "profile" && CountryRequired,
      postalCode:
        OTPshow === 1 && props.page === "profile" && PostalCodeRequired,
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setloading(true);
      const payload = {
        logoUrl: values.profile?.url || "",
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.mobile,
        countryCode: values.countryCode,
        gender: values.gender,
        postalCode: values.postalCode,
        termsAccepted: props.page === "signup" ? values.term === true : undefined,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          country: values.country,
        },
      };

      if (props.page === "profile") {
        delete payload.password;
        delete payload.email;
        delete payload.phone;
        delete payload.countryCode;
      }
      if (props.page === "signup") {
        delete payload.address;
        delete payload.gender;
        delete payload.postalCode;
        delete payload.logoUrl;
      }

      if (token && props.page === "profile") {
        SetProfileApi(payload).then((res) => {
          if (res?.status === 1) {
            toast.success(res.message);
            setloading(false);
            // Step 2 of sign-up done: on to where the customer was going, once the saved address is loaded (the
            // header sends anyone without one back to step 2). In Account: stay on the page.
            Promise.resolve(fetchgetProfile()).then(() => isOnboarding && push(pageAfterLogin(Cookies)));
          } else {
            setloading(false);
            toast.error(res.message);
          }
        });
      } else {
        if (OTPshow === 1 && isSocial) {
          SocialCompleteApi({ phone: values.mobile, countryCode: values.countryCode, termsAccepted: true }).then((res) => {
            setloading(false);
            if (res?.status === 1) {
              setSent(res?.data);
              setOTPshow(3);
              setSeconds(res?.data?.codeValidFor || 600);
            } else {
              toast.error(res?.message);
            }
          });
        } else if (OTPshow === 1) {
          RegisterApi(payload).then((res) => {
            if (res?.status === 1) {
              if (props.page !== "signup") toast.success(res.message); // sign-up: the code screen says it
              setloading(false);
              if (props.page === "signup") {
                Cookies.set(TOKEN_NAME_REG, res?.data?.token);
                setTimeout(() => {
                  setOTPshow(3); // "Check your phone": sign-up is verified by a text code (contract C5)
                  setSeconds(600);
                }, 100);
              }
            } else {
              setloading(false);
              toast.error(res.message);
            }
          });
        } else {
          OTPVerificationApi({ loginOtp: values.otp }).then((res) => {
            if (res?.status === 1) {
              toast.success(res.message);
              Cookies.set(TOKEN_NAME, res?.data?.token);
              Cookies.remove(TOKEN_NAME_REG);
              // Google / Apple already confirmed the email: no "we sent a link" note on step 2.
              if (!isSocial && res?.data?.user && !res.data.user.emailVerified) Cookies.set("emailLinkSent", res.data.user.email || "1");
              // if (OTPshow === 2) {
              //   formik.setFieldValue("otp", "");
              //   setTimeout(() => {
              //     setOTPshow(3);
              //   }, 100);
              // } else {
              //   push("/");
              // }
              Cookies.remove("socialName");
              Cookies.remove("socialEmail");
              push("/set-profile"); // step 2 of sign-up: home address (C5)
              setloading(false);
            } else {
              setloading(false);
              toast.error(res.message);
            }
          });
        }
      }
    },
  });

  useEffect(() => {
    if (CountryList?.length === 0)
      LocationApi().then((res) => {
        if (res?.status === 1) {
          // console.log(res, "res");
          setCountryList(res?.data);
        }
      });
  }, []);
  useEffect(() => {
    if (StateList?.length === 0)
      LocationApi({ country: formik.values.country }).then((res) => {
        if (res?.status === 1) {
          setStateList(res?.data);
        }
      });
  }, [formik.values.country]);

  // Any-Buddy serves the US only: preselect it when the profile has no country yet.
  useEffect(() => {
    const us = CountryList?.find((c) => /^United States( of America)?$/i.test(c?.name));
    if (us && !formik.values.country) formik.setFieldValue("country", us.name);
  }, [CountryList]);

  useEffect(() => {
    if (CityList?.length === 0 && formik.values.state) {
      LocationApi({
        country: formik.values.country,
        state: formik.values.state,
      }).then((res) => {
        if (res?.status === 1) {
          setCityList(res?.data);
        }
      });
    }
  }, [formik.values.state]);

  const resendCode = () => {
    ResendOTPApi({
      email: formik.values.email || socialEmail,
    }).then((res) => {
      // The timer follows the server: a new code (10 min), the code still live (its time left), or no code (stays 0).
      if (res?.status === 1) {
        toast.success(res?.message);
        setSeconds(res?.data?.codeValidFor || 600);
      } else if (res?.data?.codeValidFor) {
        toast.info(res.message);
        setSeconds(res.data.codeValidFor);
      } else {
        toast.error(res?.message);
      }
    });
  };

  const isSignup = props.page === "signup";
  const isProfile = props.page === "profile";
  // /set-profile = step 2 of sign-up (contract C5: gender + address). In Account it is the "My profile" editor.
  const isOnboarding = props.page === "profile" && !props.inAccount;
  const otpTarget =
    OTPshow === 2
      ? formik.values.email || email
      : sent?.sentTo || `${formik.values.countryCode} ${formik.values.mobile}`;

  // All 6 digits in (typed or pasted): verify straight away - no extra click. The button stays for keyboards and retries.
  useEffect(() => {
    if (OTPshow !== 1 && formik.values.otp?.length === 6 && !loading) formik.submitForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.otp]);

  return (
    <>
      <div className="ab-auth__head ab-sp__head">
        {OTPshow !== 1 ? (
          <>
            {/* Same label as step 1, so the title sits at exactly the same height (no jump between the two). */}
            <span className="ab-auth__step">Step 1 of 2 · Verify</span>
            <h1>{OTPshow === 2 ? "Check your email" : "Check your phone"}</h1>
            <p>
              Enter the 6-digit code we sent to{" "}
              {otpTarget?.trim() ? <strong>{otpTarget}</strong> : "you"}.
            </p>
          </>
        ) : isSignup ? (
          <>
            <span className="ab-auth__step">Step 1 of 2</span>
            <h1>Create your account</h1>
            <p>Book local pros and keep every booking in one place.</p>
          </>
        ) : isSocial ? (
          <>
            <span className="ab-auth__step">Step 1 of 2</span>
            <h1>Finish signing up</h1>
            <p>
              {socialName || socialEmail ? (
                <>
                  Signed in as <strong>{socialName || socialEmail}</strong>
                  {socialName && socialEmail ? ` (${socialEmail})` : ""}.{" "}
                </>
              ) : null}
              Add your phone number to finish.
            </p>
          </>
        ) : props.inAccount ? null /* the account page has its own title */ : (
          <>
            <span className="ab-auth__step">Step 2 of 2</span>
            <h1>Your home address</h1>
            <p>Your address helps your Buddy find you on the day.</p>
            {linkSentTo && (
              <p className="ab-otp-notice" role="status">
                Phone verified. We also sent a link to confirm your email
                {linkSentTo !== "1" ? <> (<strong>{linkSentTo}</strong>)</> : null}. You can confirm it any time.
              </p>
            )}
          </>
        )}
      </div>
      <form onSubmit={formik.handleSubmit} noValidate>
        {OTPshow === 1 && (
          <div className="ab-sp__grid">
            {formik.values.firstName && isProfile && !isOnboarding && (
              <div className="ab-sp__photo">
                <div className="ab-sp__avatar">
                  <ImageUploadInput
                    isMultiple={false}
                    mainClass="upload-btn-wrapper"
                    onlyInput={false}
                    formik={formik}
                    imageURL={formik.values.profile}
                    defaultImg={employeImg}
                    inputKey={`profile`}
                    showText="no"
                    Text="Upload Photo"
                    folderName={`Profile`}
                    ImgName={
                      formik.values.firstName
                        ? formik.values.firstName?.replaceAll(" ", "-")
                        : ""
                    }
                  />
                  <span className="ab-sp__cam" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                  </span>
                </div>
                <div>
                  <b>Profile photo</b>
                  <small>Tap the photo to upload a new one. JPG or PNG.</small>
                </div>
              </div>
            )}

            {!isOnboarding && (
              <>
            {isProfile && <h2 className="ab-sp__section">Personal details</h2>}

            {!isSocial && (
              <>

            <div className="ab-field ab-sp__name">
              <label htmlFor="ab-first-name" className="ab-label">
                First name
              </label>
              <input
                id="ab-first-name"
                type="text"
                autoComplete="given-name"
                className="form-control"
                placeholder="e.g. Jordan"
                {...formik.getFieldProps("firstName")}
              />
              {showError(formik, "firstName") && (
                <div className="ab-error" role="alert">
                  {formik.errors.firstName}
                </div>
              )}
            </div>
            <div className="ab-field ab-sp__name">
              <label htmlFor="ab-last-name" className="ab-label">
                Last name
              </label>
              <input
                id="ab-last-name"
                type="text"
                autoComplete="family-name"
                className="form-control"
                placeholder="e.g. Smith"
                {...formik.getFieldProps("lastName")}
              />
              {showError(formik, "lastName") && (
                <div className="ab-error" role="alert">
                  {formik.errors.lastName}
                </div>
              )}
            </div>
            <div className="ab-field">
              <label htmlFor="ab-signup-email" className="ab-label">
                Email address
              </label>
              <input
                id="ab-signup-email"
                type="email"
                autoComplete="email"
                className="form-control"
                placeholder="you@example.com"
                {...formik.getFieldProps("email")}
              disabled={props.page === "profile" ? true : false}
              />
              {showError(formik, "email") && (
                <div className="ab-error" role="alert">
                  {formik.errors.email}
                </div>
              )}
            </div>
              </>
            )}
            <div className={`ab-field${isSocial ? " ab-sp__full" : ""}`}>
              <label htmlFor="ab-signup-phone" className="ab-label">
                Phone number
              </label>
              <MobileInput
                mobile="mobile"
                countryCode="countryCode"
                formik={formik}
                inputId="ab-signup-phone"
                value={`${formik.values.countryCode} ${formik.values.mobile}`}
                disabled={props.page === "profile" ? true : false}
              />
              {showError(formik, "mobile") && (
                <div className="ab-error" role="alert">
                  {formik.errors.mobile}
                </div>
              )}
            </div>
              </>
            )}
            {isSignup && (
              <>
                <div className="ab-field">
                  <label htmlFor="ab-signup-password" className="ab-label">
                    Password
                  </label>
                  <div className="ab-control ab-pw">
                    <input
                      id="ab-signup-password"
                      type={formik.values.toggle ? "text" : "password"}
                      autoComplete="new-password"
                      className="form-control"
                      placeholder="At least 8 characters"
                      {...formik.getFieldProps("password")}
                    />
                    <button
                      type="button"
                      className="ab-pw__toggle"
                      aria-label={formik.values.toggle ? "Hide password" : "Show password"}
                      aria-pressed={formik.values.toggle}
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
                    >
                      <Icon name={formik.values.toggle ? "eyeOff" : "eye"} size={20} />
                    </button>
                  </div>
                  {showError(formik, "password") && (
                    <div className="ab-error" role="alert">
                      {formik.errors.password}
                    </div>
                  )}
                </div>
                <div className="ab-field">
                  <label htmlFor="ab-signup-confirm" className="ab-label">
                    Confirm password
                  </label>
                  <div className="ab-control ab-pw">
                    <input
                      id="ab-signup-confirm"
                      type={formik.values.toggle1 ? "text" : "password"}
                      autoComplete="new-password"
                      className="form-control"
                      placeholder="Enter it again"
                      {...formik.getFieldProps("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="ab-pw__toggle"
                      aria-label={formik.values.toggle1 ? "Hide password" : "Show password"}
                      aria-pressed={formik.values.toggle1}
                      onClick={(e) => {
                        e.preventDefault();
                        formik.setFormikState((prevState) => {
                          return {
                            ...prevState,
                            values: {
                              ...prevState.values,
                              toggle1: !prevState.values.toggle1,
                            },
                          };
                        });
                      }}
                    >
                      <Icon name={formik.values.toggle1 ? "eyeOff" : "eye"} size={20} />
                    </button>
                  </div>
                  {showError(formik, "confirmPassword") && (
                    <div className="ab-error" role="alert">
                      {formik.errors.confirmPassword}
                    </div>
                  )}
                </div>
              </>
            )}
            {isProfile && (
              <>
                <div className="ab-field">
                  <label htmlFor="ab-gender" className="ab-label">
                    Gender
                  </label>
                  <Select
                    id="ab-gender"
                    name="gender"
                    value={formik.values.gender}
                    onChange={(v) => formik.setFieldValue("gender", v)}
                    onBlur={formik.handleBlur}
                    options={GENDERS}
                  />
                  {showError(formik, "gender") && (
                    <div className="ab-error" role="alert">
                      {formik.errors.gender}
                    </div>
                  )}
                </div>

                <h2 className="ab-sp__section">Address</h2>

                <div className="ab-field ab-sp__full">
                  <label htmlFor="ab-street" className="ab-label">
                    Street address
                  </label>
                  <input
                    id="ab-street"
                    type="text"
                    autoComplete="street-address"
                    className="form-control"
                    {...formik.getFieldProps("street")}
                    placeholder="e.g. 120 Main Street, Apt 4B"
                  />
                  {showError(formik, "street") && (
                    <div className="ab-error" role="alert">
                      {formik.errors.street}
                    </div>
                  )}
                </div>
                <div className={`ab-field ab-sp__country${formik.values.country ? " is-set" : ""}`}>
                  <label htmlFor="ab-country" className="ab-label">
                    Country
                  </label>
                  <Select
                    id="ab-country"
                    name="country"
                    value={formik.values.country}
                    placeholder="Select country"
                    onBlur={formik.handleBlur}
                    options={(CountryList || []).map((c) => ({ value: c?.name, label: c?.name }))}
                    onChange={(v) => {
                      formik.setFieldValue("country", v);
                      formik.setFieldValue("state", "");
                      formik.setFieldValue("city", "");
                      setStateList([]);
                      setCityList([]);
                    }}
                  />
                  {showError(formik, "country") && (
                    <div className="ab-error" role="alert">
                      {formik.errors.country}
                    </div>
                  )}
                </div>
                <div className="ab-field ab-sp__third">
                  <label htmlFor="ab-state" className="ab-label">
                    State
                  </label>
                  <Select
                    id="ab-state"
                    name="state"
                    value={formik.values.state}
                    placeholder="Select state"
                    onBlur={formik.handleBlur}
                    options={(StateList || []).map((c) => ({ value: c?.name, label: c?.name }))}
                    onChange={(v) => {
                      formik.setFieldValue("state", v);
                      formik.setFieldValue("city", "");
                      setCityList([]);
                    }}
                  />
                  {showError(formik, "state") && (
                    <div className="ab-error" role="alert">
                      {formik.errors.state}
                    </div>
                  )}
                </div>
                <div className="ab-field ab-sp__third">
                  <label htmlFor="ab-city" className="ab-label">
                    City
                  </label>
                  <Select
                    id="ab-city"
                    name="city"
                    value={formik.values.city}
                    placeholder={formik.values.state === "" ? "State first" : "Select city"}
                    disabled={formik.values.state === ""}
                    onBlur={formik.handleBlur}
                    options={(CityList || []).map((c) => ({ value: c?.name, label: c?.name }))}
                    onChange={(v) => formik.setFieldValue("city", v)}
                  />
                  {showError(formik, "city") && (
                    <div className="ab-error" role="alert">
                      {formik.errors.city}
                    </div>
                  )}
                </div>
                <div className="ab-field ab-sp__third">
                  <label htmlFor="ab-postal" className="ab-label">
                    ZIP code
                  </label>
                  <input
                    id="ab-postal"
                    type="text"
                    autoComplete="postal-code"
                    className="form-control"
                    {...formik.getFieldProps("postalCode")}
                    placeholder="e.g. 10001"
                  />
                  {showError(formik, "postalCode") && (
                    <div className="ab-error" role="alert">
                      {formik.errors.postalCode}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {OTPshow !== 1 && (isSignup || isSocial) && (
          <>
            <div className="ab-otp" role="group" aria-labelledby="ab-signup-otp-label">
              <span id="ab-signup-otp-label" className="ab-label">
                Verification code
              </span>
              <OTPInput
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
            {seconds === 0 ? (
              <div className="ab-otp__resend">
                <button
                  type="button"
                  className="ab-textbtn"
                  onClick={resendCode}
                >
                  Send a new code
                </button>
              </div>
            ) : (
              <p className="ab-otp__meta">
                You can request a new code in{" "}
                <span className="ab-num">
                  {minutesLeft} min
                </span>
              </p>
            )}
          </>
        )}
        <div className="ab-form-actions">
          {(isSignup || isSocial) && OTPshow === 1 && (
            <div className="ab-check">
              <label>
                <input type="checkbox" {...formik.getFieldProps("term")} checked={formik.values.term} />
                <span>
                  I&apos;m 18 or older and agree to the{" "}
                  <Link href="/terms-conditions" target="_blank">Terms of Use</Link> and{" "}
                  <Link href="/privacy-policy" target="_blank">Privacy Policy</Link>.
                </span>
              </label>
              {showError(formik, "term") && <p className="ab-error">{formik.errors.term}</p>}
            </div>
          )}
          <button
            className="ab-btn ab-btn--primary ab-btn--lg ab-btn--block"
            type="submit"
            aria-busy={loading}
          >
            {loading ? (
              <Loader color="#fff" />
            ) : OTPshow !== 1 ? (
              "Verify and continue"
            ) : isSignup ? (
              "Create account"
            ) : isSocial ? (
              "Continue"
            ) : isOnboarding ? (
              "Finish"
            ) : (
              "Save profile"
            )}
          </button>
        </div>
      </form>
      {isSignup && OTPshow === 1 && <SocialButtons onPick={(provider) => signIn(provider, { callbackUrl: "/login" })} />}
    </>
  );
}

export default SetProfile;
