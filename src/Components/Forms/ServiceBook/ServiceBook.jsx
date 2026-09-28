"use client";
import { markTaskDone } from "@/Until/bookingTask";
import Loader from "@/Components/Loader/Loader";
import { mapApiKey } from "@/Until";
import Icon from "@/Components/ui/Icon";
import {
  AddressRequired,
  TimeIntervalRequired,
  VehicleRequired, showError } from "@/Until/ValidationError";
import { BookProccedApi } from "@/api/setting";
import { useDataStore } from "@/api/store/store";
import { locateAddress } from "@/Until/searchLocation";
import { useFormik } from "formik";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import "../FormStyle.css";
import "../../booking.css";
// The address box appears only once Google's script has loaded (the skeleton shows until then). The library attaches
// to its input after the script loads; if the customer pressed Continue first (the address is pre-filled from the
// profile), the box was already gone and it logged "Input ref must be HTMLInputElement".
const Autocomplete = dynamic(async () => {
  const [lib, { loadGoogleMapScript }] = await Promise.all([
    import("react-google-autocomplete"),
    import("react-google-autocomplete/lib/utils"),
  ]);
  const base = "https://maps.googleapis.com/maps/api/js";
  // Same script the library would load. Wait at most 4 s: if Google is blocked or slow, the box still shows (typing
  // works, suggestions come if the script arrives).
  await Promise.race([
    loadGoogleMapScript(base, `${base}?libraries=places&key=${mapApiKey}`),
    new Promise((r) => setTimeout(r, 4000)),
  ]);
  return lib.default;
}, {
  ssr: false,
  loading: () => <div className="ab-skeleton" style={{ height: 52 }} />,
});

function ServiceBook(props) {
  const [loading, setloading] = useState(false);
  const { push } = useRouter();
  const startLocationRef = useRef();
  const endAutocompleteRef = useRef();

  // console.log(props.serviceTaskArr, "props.serviceTaskArr");

  // D-22 (28 Sep): the id is the hours sent as timeInterval; 4 hours is the most one booking covers.
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
      // Only when the service asks for a task size (the field is not shown otherwise, so its error could never show
      // and Continue silently did nothing).
      // Every booking has a size now (owner D-22: 1 / up to 3 / up to 4 hrs sets the upfront charge), whatever the
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
      // console.log(payload, "payload");

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

  // C25 + C36: the task address starts as the customer's profile address (saved at sign-up step 2); they can change it
  // or pick another from the suggestions. Only fills an empty field, once the profile has loaded.
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
              <Suspense fallback={<div className="ab-skeleton" style={{ height: 52 }} />}>
                <Autocomplete
                  apiKey={mapApiKey}
                  id="ab-task-start"
                  name="address"
                  // defaultValue={formik.values.address || ""}
                  value={formik.values.address || ""}
                  ref={startLocationRef}
                  className="form-control ab-input"
                  placeholder="Street address, city or ZIP code"
                  autoComplete="off"
                  onChange={() => {
                    if (startLocationRef.current) {
                      formik.setFieldValue(
                        "address",
                        startLocationRef.current.value
                      );
                      formik.setFieldValue("lat", "");
                      formik.setFieldValue("lng", "");

                      if (startLocationRef.current.value === "") {
                        startLocationRef.current.value = "";
                      }
                    }
                  }}
                  onPlaceSelected={(place, inputRef, autocompleteRef) => {
                    if (place) {
                      let lat = place.geometry.location.lat();
                      let lng = place.geometry.location.lng();
                      let address = place.formatted_address;
                      // console.log(place.name, "place.geometry");
                      formik.setFieldValue("address", address);
                      formik.setFieldValue("lat", lat);
                      formik.setFieldValue("lng", lng);
                    }
                  }}
                  options={{
                    types: ["geocode", "establishment"],
                    componentRestrictions: { country: "us" }, // Any-Buddy serves US addresses only
                  }}
                />
              </Suspense>
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
                <Autocomplete
                  apiKey={mapApiKey}
                  id="ab-task-end"
                  name="address"
                  value={formik.values.endAddress}
                  ref={endAutocompleteRef}
                  className="form-control ab-input"
                  placeholder="Street address, city or ZIP code"
                  autoComplete="off"
                  onChange={() => {
                    if (endAutocompleteRef.current) {
                      formik.setFieldValue(
                        "endAddress",
                        endAutocompleteRef.current.value
                      );
                      formik.setFieldValue("endLat", "");
                      formik.setFieldValue("endLng", "");
                    }
                  }}
                  onPlaceSelected={(place, inputRef, endAutocompleteRef) => {
                    if (place) {
                      let lat = place.geometry.location.lat();
                      let lng = place.geometry.location.lng();
                      let address = place.formatted_address;
                      // console.log(place.name, "place.geometry");
                      formik.setFieldValue("endAddress", address);
                      formik.setFieldValue("endLat", lat);
                      formik.setFieldValue("endLng", lng);
                    }
                  }}
                  options={{
                    types: ["geocode", "establishment"],
                    componentRestrictions: { country: "us" },
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
