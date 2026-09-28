"use client";
import "@/app/(AfterLogin)/booking/bookings.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { ReasonRequired, showError } from "@/Until/ValidationError";
import Loader from "@/Components/Loader/Loader";

function BookingCencel(props) {
  const [loading, setloading] = useState(false);
  const initialValues = {
    cancelReason: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      cancelReason: ReasonRequired,
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setloading(true);

      props.cencelBooking(values.cancelReason);
      props.handleShow();
    },
  });

  return (
    <form className="ab-mform" onSubmit={formik.handleSubmit} noValidate>
      <p className="ab-mform__intro">
        Let us know why you&apos;re cancelling. The booking moves to your
        Cancelled tab once it&apos;s done.
      </p>
      <div className="ab-field">
        <label htmlFor="ab-cancel-reason" className="ab-label">
          Reason for cancelling
        </label>
        <textarea
          id="ab-cancel-reason"
          rows={5}
          className="ab-input"
          placeholder="For example: my plans changed"
          aria-invalid={!!(showError(formik, "cancelReason"))}
          aria-describedby="ab-cancel-reason-err"
          {...formik.getFieldProps("cancelReason")}
        />
        {showError(formik, "cancelReason") && (
          <div className="ab-error" id="ab-cancel-reason-err" role="alert">
            {formik.errors.cancelReason}
          </div>
        )}
      </div>
      <button type="submit" className="ab-btn ab-btn--danger ab-btn--block" disabled={loading}>
        {loading ? <Loader color="#fff" /> : "Cancel booking"}
      </button>
    </form>
  );
}

export default BookingCencel;
