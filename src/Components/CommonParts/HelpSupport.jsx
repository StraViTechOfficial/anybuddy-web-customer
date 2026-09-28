"use client";
import { SendHelpApi } from "@/api/setting";
import "@/app/(AfterLogin)/profile/profile.css";
import Icon from "@/Components/ui/Icon";
import { EmailValidation, showError } from "@/Until/ValidationError";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Loader from "../Loader/Loader";

function HelpSupport() {
  const { push } = useRouter();
  const [loading, setloading] = useState(false);
  const initialValues = {
    firstName: "",
    email: "",
    msg: "",
  };
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      firstName: Yup.string().required("Enter your name"),
      msg: Yup.string().required("Add a short message"),
      email: EmailValidation,
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setloading(true);
      const payload = {
        name: values.firstName,
        email: values.email,
        description: values.msg,
        role: 1,
      };

      SendHelpApi(payload).then((res) => {
        if (res?.status === 1) {
          toast.success(res.message);
          push("/");
          setloading(false);
        } else {
          setloading(false);
          toast.error(res.message);
        }
      });
    },
  });
  const err = (k) => showError(formik, k) && (
    <div className="ab-error" id={`ab-help-${k}-err`} role="alert">
      {formik.errors[k]}
    </div>
  );
  return (
    <div className="ab-help">
      <form className="ab-help__form" onSubmit={formik.handleSubmit} noValidate>
        <div className="ab-field">
          <label htmlFor="ab-help-firstName" className="ab-label">Full name</label>
          <input
            id="ab-help-firstName"
            type="text"
            required
            autoComplete="name"
            className="ab-input"
            placeholder="Your name"
            {...formik.getFieldProps("firstName")}
          />
          {err("firstName")}
        </div>
        <div className="ab-field">
          <label htmlFor="ab-help-email" className="ab-label">Email</label>
          <input
            id="ab-help-email"
            type="email"
            required
            autoComplete="email"
            className="ab-input"
            placeholder="you@example.com"
            {...formik.getFieldProps("email")}
          />
          {err("email")}
        </div>
        <div className="ab-field">
          <label htmlFor="ab-help-msg" className="ab-label">How can we help</label>
          <textarea
            id="ab-help-msg"
            rows={5}
            className="ab-input"
            placeholder="Tell us what happened, and include a booking number if you have one."
            {...formik.getFieldProps("msg")}
          />
          {err("msg")}
        </div>
        <button className="ab-btn ab-btn--primary ab-btn--lg" type="submit" disabled={loading}>
          {loading ? <Loader color="#fff" /> : "Send message"}
        </button>
      </form>
      <aside className="ab-help__aside">
        <h3>Prefer email</h3>
        <p>Write to us directly and include your booking number so we can look it up quickly.</p>
        <a href="mailto:info@any-buddy.com">
          <Icon name="mail" size={18} />
          info@any-buddy.com
        </a>
      </aside>
    </div>
  );
}

export default HelpSupport;
