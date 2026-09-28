"use client";
import { showError } from "@/Until/ValidationError";
import Loader from "@/Components/Loader/Loader";
import { useFormik } from "formik";
import { useState } from "react";
import { Rating } from "react-simple-star-rating";
import * as Yup from "yup";
import "@/app/(AfterLogin)/booking/bookings.css";
import { AddRatingReviewApi } from "@/api/setting";
import { toast } from "react-toastify";

function WriteReview(props) {
  const [loading, setloading] = useState(false);

  const initialValues = {
    feedback: "",
    rating: "",
  };
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      feedback: Yup.string().required("Required"),
      rating: Yup.string().required("Required"),
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setloading(true);
      const payload = {
        vendorId: props.VenderId,
        serviceId: props.ServiceId,
        rating: values.rating,
        message: values.feedback,
        bookingId: props.BookingId,
      };

      AddRatingReviewApi(payload).then((res) => {
        if (res?.status === 1) {
          toast.success(res.message);
          props.apiCall(props.params);
          props.handleShow();
        } else {
          setloading(false);
          toast.error(res.message);
        }
      });
    },
  });
  return (
    <form className="ab-mform" onSubmit={formik.handleSubmit} noValidate>
      <p className="ab-mform__intro">
        Your review helps neighbors choose the right Buddy.
      </p>
      <div className="ab-mform__rating">
        <span className="ab-label" id="ab-review-rating">
          Your rating
        </span>
        <Rating
          onClick={(val) => {
            formik.setFieldValue("rating", val);
          }}
          initialValue={formik.values.rating}
          allowFraction
          size={34}
          fillColor="#24345f"
          emptyColor="#cfd6e4"
          transition
        />
        {showError(formik, "rating") && (
          <div className="ab-error" role="alert">
            Choose a star rating
          </div>
        )}
      </div>
      <div className="ab-field">
        <label htmlFor="ab-review-text" className="ab-label">
          Your review
        </label>
        <textarea
          id="ab-review-text"
          rows={5}
          className="ab-input"
          placeholder="How did the visit go?"
          aria-invalid={!!(showError(formik, "feedback"))}
          {...formik.getFieldProps("feedback")}
        />
        {showError(formik, "feedback") && (
          <div className="ab-error" role="alert">
            Add a few words about your visit
          </div>
        )}
      </div>
      <button className="ab-btn ab-btn--primary ab-btn--block" type="submit" disabled={loading}>
        {loading ? <Loader color="#fff" /> : "Post review"}
      </button>
    </form>
  );
}

export default WriteReview;
