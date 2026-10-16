import * as Yup from "yup";

export const EmailValidation = Yup.string()
  .trim()
  .email("Enter a valid email address, like name@example.com.")
  .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Enter a valid email address, like name@example.com.")
  .max(254, "That email address is too long.")
  .required("Enter your email address.");
export const PasswordRequired = Yup.string().required("Enter your password.");
// New passwords (sign-up, reset, change): at least 8 characters (the backend accepts 6-128; 8 is the safer floor).
export const NewPassword = Yup.string()
  .required("Create a password.")
  .min(8, "Use at least 8 characters.")
  .max(128, "Use 128 characters or fewer.");
export const PasswordMatch = Yup.string()
  .required("Enter the password again.")
  .oneOf([Yup.ref("password"), null], "The passwords don't match.");
export const OTPRequired = Yup.string().required("Enter the 6-digit code.").matches(/^\d{6}$/, "Enter all 6 digits.");
// Any country. +1 (US, Canada): exactly 10 digits. Other countries: 6-14 digits, so the whole
// number stays within the backend's 7-15 digits.
export const MobileRequired = Yup.string()
  .required("Enter your phone number.")
  .test("phone-length", "Enter a valid phone number.", function (v) {
    const digits = String(v || "").replace(/\D/g, "");
    const plusOne = String(this.parent?.countryCode || "+1").replace(/\D/g, "") === "1";
    if (plusOne) return digits.length === 10 || this.createError({ message: "Enter a 10-digit phone number." });
    return (digits.length >= 6 && digits.length <= 14) || this.createError({ message: "Enter a valid phone number for that country." });
  });
export const BooleanValidation = Yup.boolean().oneOf([true], "Required");
// Mirrors the backend: 2-50 characters.
export const LastNameRequired = Yup.string()
  .trim()
  .required("Enter your last name.")
  .min(2, "Use at least 2 characters.")
  .max(50, "Use 50 characters or fewer.");
export const GenderRequired = Yup.string().required("Choose an option.");
export const AddressRequired = Yup.string().trim().required("Enter the address.");
export const TimeIntervalRequired = Yup.string().required(
  "Choose a task size."
);
export const VehicleRequired = Yup.string().required("Vehicle is Required");
export const TimeRequired = Yup.string().required("Slot is Required");
// Mirrors the backend: 2-50 characters.
export const FirstNameRequired = Yup.string()
  .trim()
  .required("Enter your first name.")
  .min(2, "Use at least 2 characters.")
  .max(50, "Use 50 characters or fewer.");
export const StreetRequired = Yup.string().trim().required("Enter your street address.");
export const CityRequired = Yup.string().required("Choose your city.");
export const StateRequired = Yup.string().required("Choose your state.");
export const CountryRequired = Yup.string().required("Choose your country.");
// Mirrors the backend rule in validation/usZip.js.
export const PostalCodeRequired = Yup.string()
  .required("Enter your ZIP code.")
  .matches(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code (12345 or 12345-6789).");
export const ReasonRequired = Yup.string().required("Reason is Required");

// When a field's message shows (every form on the site): after the customer tries to submit, or once they have typed
// something that's wrong. Clicking into an empty field and out again shows nothing.
const isBlank = (v) => v === undefined || v === null || v === false || (typeof v === "string" && v.trim() === "");
export const showError = (formik, name) =>
  Boolean(formik.errors?.[name] && formik.touched?.[name] && (formik.submitCount > 0 || !isBlank(formik.values?.[name])));
