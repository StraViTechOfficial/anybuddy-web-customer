"use client";
import { markTaskDone } from "@/Until/bookingTask";
import Loader from "@/Components/Loader/Loader";
import Icon from "@/Components/ui/Icon";
import {
  AddressRequired,
  TimeIntervalRequired,
  VehicleRequired, showError } from "@/Until/ValidationError";
import { BookProccedApi } from "@/api/setting";
import { useDataStore } from "@/api/store/store";
import { locateAddress } from "@/Until/searchLocation";
import AddressInput from "./AddressInput";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import "../FormStyle.css";
import "../../booking.css";
function ServiceBook(props) {
  const [loading, setloading] = useState(false);
  const { push } = useRouter();


  // The id is the number of hours sent as timeInterval. 4 hours is the most one booking covers.
  const timeIntervalArr = [
    { id: "1", title: "Small", hint: "Est. 1 hr" },
    { id: "3", title: "Medium", hint: "Est. 2–3 hrs" },
    { id: "4", title: "Large", hint: "Up to 4 hrs" },
  ];

  const vehicleArr = [
    { id: "car", title: "Car", hint: "Task requires a car" },
    { id: "truck", title: "Truck", hint: "Task requires a truck" },
  ];

  const initialValues = {
    timeInterval: "",
    describe: "",
    address: "",
    lat: "",
    lng: "",
    endAddress: "",
    endLat: "",
    endLng: "",
    vehicle: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      // Only required when the service asks for a task size. The field is not shown otherwise, so its error could never
      // show and Continue silently did nothing.
      // Every booking has a size now (1 hour, up to 3 or up to 4 hours, which sets the upfront charge), whatever the
      // service's old "time interval" admin switch says.
      timeInterval: props.Type === 2 && TimeIntervalRequired,
      vehicle:
        props.Type === 2 && props.serviceTaskArr?.vehicle && VehicleRequired,
      address: props.Type === 1 && AddressRequired,
      endAddress:
        props.Type === 1 &&
        props.serviceTaskArr?.startAddress &&
        props.serviceTaskArr?.endAddress &&
        AddressRequired,
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setloading(true);
      const payload = {
        timeInterval: values.timeInterval,
        description: values.describe,
        address: values.address,
        lat: values.lat,
        long: values.lng,
        endAddress: values.endAddress,
        endLat: values.endLat,
        endLong: values.endLng,
        vehicle: values.vehicle,
      };

      if (props.Type < 3) {
        props.findName(props.Type + 1);
        props.setType(props.Type + 1);
        props.setEditShow(true);
        setloading(false);
      } else {
        BookProccedApi(payload).then((res) => {
          if (res?.status === 1) {
            markTaskDone(props.sub_service);
            push(`/service/${props.service_name}/${props.sub_service}`);
          } else {
            toast.error(res?.message);
            setloading(false);
          }
        });
      }
    },
  });

  // The task address starts as the customer's profile address (saved at sign-up step 2), and they can change it or
  // pick another from the suggestions. It only fills an empty field, once the profile has loaded.
  const profile = useDataStore((store) => store.getProfile);
  useEffect(() => {
    const a = profile?.address;
    if (props.Type !== 1 || formik.values.address || !a?.street || !profile?.postalCode) return;
    const text = [a.street, a.city, [a.state, profile.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    formik.setFieldValue("address", text);
    locateAddress(text)
      .then((f) => f && !formik.values.lat && (formik.setFieldValue("lat", f.lat), formik.setFieldValue("lng", f.long)))
      .catch(() => {});
  }, [props.Type, profile?.postalCode, profile?.address?.street]);

  const hasEnd =
    props.serviceTaskArr?.startAddress && props.serviceTaskArr?.endAddress;

  const options = (label, arr, field, note) => (
    <fieldset className="ab-opts">
      <legend className="ab-label">{label}</legend>
      <div className="ab-opts__grid" role="radiogroup">
        {arr?.map((item, i) => {
          const on = item?.id === formik.values[field];
          return (
            <button
              type="button"
              role="radio"
              aria-checked={on}
              className={`ab-opt${on ? " is-on" : ""}`}
              key={`${field}-${i}`}
              onClick={() => {
                formik.setFieldValue(field, item?.id);
              }}
            >
              <span className="ab-opt__radio" aria-hidden="true" />
              <span className="ab-opt__text">
                <b>{item?.title}</b>
                <span>{item?.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
      {note && <p className="ab-opts__note">{note}</p>}
      {showError(formik, field) && (
        <p className="ab-error">
          <Icon name="alert" size={16} /> {formik.errors[field]}
        </p>
      )}
    </fieldset>
  );

  const submitBtn = (label) => (
    <div className="ab-book__actions">
      <button
        type="submit"
        className="ab-btn ab-btn--primary ab-btn--lg"
        disabled={loading}
      >
        {loading ? (
          <Loader color="#fff" height="22" width="60" />
        ) : (
          <>
            {label}
            <Icon name="arrowRight" size={18} className="ab-arrow" />
          </>
        )}
      </button>
    </div>
  );

  return (
    <form className="ab-book__form" onSubmit={formik.handleSubmit} noValidate>
      {props.Type === 1 ? (
        <>
          <div className="ab-field">
            <label className="ab-label" htmlFor="ab-task-start">
              {hasEnd ? "Start location" : "Task address"}
            </label>
            <div className="ab-book__input">
              <Icon name="pin" size={20} />
              <AddressInput
                id="ab-task-start"
                name="address"
                value={formik.values.address || ""}
                className="form-control ab-input"
                placeholder="Street address, city or ZIP code"
                onType={(text) => {
                  formik.setFieldValue("address", text);
                  formik.setFieldValue("lat", "");
                  formik.setFieldValue("lng", "");
                }}
                onPick={({ address, lat, lng }) => {
                  formik.setFieldValue("address", address);
                  formik.setFieldValue("lat", lat);
                  formik.setFieldValue("lng", lng);
                }}
              />
            </div>
            {showError(formik, "address") && (
              <p className="ab-error">
                <Icon name="alert" size={16} /> {formik.errors.address}
              </p>
            )}
          </div>
          {hasEnd && (
            <div className="ab-field">
              <label className="ab-label" htmlFor="ab-task-end">
                End location
              </label>
              <div className="ab-book__input">
                <Icon name="pin" size={20} />
                <AddressInput
                  id="ab-task-end"
                  name="endAddress"
                  value={formik.values.endAddress || ""}
                  className="form-control ab-input"
                  placeholder="Street address, city or ZIP code"
                  onType={(text) => {
                    formik.setFieldValue("endAddress", text);
                    formik.setFieldValue("endLat", "");
                    formik.setFieldValue("endLng", "");
                  }}
                  onPick={({ address, lat, lng }) => {
                    formik.setFieldValue("endAddress", address);
                    formik.setFieldValue("endLat", lat);
                    formik.setFieldValue("endLng", lng);
                  }}
                />
              </div>
              {showError(formik, "endAddress") && (
                <p className="ab-error">
                  <Icon name="alert" size={16} /> {formik.errors.endAddress}
                </p>
              )}
            </div>
          )}
          {submitBtn("Continue")}
        </>
      ) : props.Type === 2 ? (
        <>
          {options("Task size", timeIntervalArr, "timeInterval",
              "A booking covers up to 4 hours; for longer work, book a second visit.")}
          {props.serviceTaskArr?.vehicle &&
            options("Vehicle requirements", vehicleArr, "vehicle")}
          {submitBtn("Continue")}
        </>
      ) : props.Type === 3 ? (
        <>
          <div className="ab-field">
            <label className="ab-label" htmlFor="ab-task-desc">
              Task details <span className="ab-book__optional">Optional</span>
            </label>
            <textarea
              id="ab-task-desc"
              rows={5}
              placeholder="What needs doing, the size of the space, access notes, pets at home…"
              className="form-control ab-input ab-book__textarea"
              {...formik.getFieldProps("describe")}
            />
            {showError(formik, "describe") && (
              <p className="ab-error">
                <Icon name="alert" size={16} /> {formik.errors.describe}
              </p>
            )}
          </div>
          {submitBtn("See available pros")}
        </>
      ) : (
        ""
      )}
    </form>
  );
}

export default ServiceBook;
