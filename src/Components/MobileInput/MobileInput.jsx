"use client";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./style.css";

function MobileInput(props) {
  return (
    <>
      <PhoneInput
        country={"us"}
        preferredCountries={["us"]} // US on top; every other country (incl. Canada) in the A-Z list below
        searchPlaceholder="Search country"
        disableSearchIcon // the library draws an emoji icon; the placeholder says what the box does
        countryCodeEditable={false}
        inputProps={{
          name: props.mobile,
          id: props.inputId,
          autoComplete: "tel", // lets the browser fill the saved phone number
        }}
        disabled={props.disabled}
        enableSearch
        value={
          props.value
            ? props.value
            : props.formik.values.mobile
            ? props.formik.values.countryCode + props.formik.values.mobile
            : props.formik.values.countryCode
        }
        onChange={(phone, country, e, formattedValue) => {
          if (phone.length > 0) {
            const raw = phone.slice(country?.dialCode?.length);
            props.formik.setFieldValue(props.mobile, raw);

            props.formik.setFieldValue(
              props.countryCode,
              formattedValue?.split(" ")[0]
            );
          } else {
            props.formik.setFieldValue(props.mobile, "");

            props.formik.setFieldValue(props.countryCode, "");
          }
        }}
        onBlur={props.formik.handleBlur}
        placeholder="Phone number"
        inputClass={props.inputClass}
        specialLabel=""
        containerClass={props.containerClass}
      />
    </>
  );
}

export default MobileInput;
