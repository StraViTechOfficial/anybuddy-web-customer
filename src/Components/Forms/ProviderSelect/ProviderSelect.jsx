"use client";
import DateCalender from "@/Components/DateCalender/DateCalender";
import Loader from "@/Components/Loader/Loader";
import Icon from "@/Components/ui/Icon";
import { ShowPrice } from "@/Until";
import { TimeRequired, showError } from "@/Until/ValidationError";
import { ReleaseCheckoutApi, SlotProviderBookApi } from "@/api/setting";
import { useDataStore } from "@/api/store/store";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useFormik } from "formik";
import moment from "moment";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { rememberPro } from "@/Until/bookingTask";
import * as Yup from "yup";
import "../FormStyle.css";
import "../../booking.css";
import CheckoutForm from "../PaymentGatway/CheckoutForm";

// Display helpers only.
const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "AB";
const fmtDate = (d) => (d ? moment(d, "YYYY-MM-DD").format("ddd, MMM D") : "");
const fmtTime = (t) => (t ? moment(t, "HH:mm").format("h:mm A") : "");

// Price breakdown straight from list-service-slots: servicePrice (hours × hourlyRate), taxAmount, totalPrice.
// The saved task size in words (D-22 sizes; anything else as plain hours).
const SIZE_LABEL = { 1: "Small (1 hr)", 3: "Medium (up to 3 hrs)", 4: "Large (up to 4 hrs)" };
const sizeLabel = (h) => SIZE_LABEL[Number(h)] || (Number(h) > 0 ? `${Number(h)} hrs` : "Size not chosen");

// Same as the iOS app (TimeVC.priceCard): with tax, Service price + Tax + Total; without, only the Total with how it
// is made under it (one line item equal to the total is noise, and "Tax $0.00" reads like a mistake).
export function PriceRows({ slot }) {
  const how = slot?.hours > 0 && slot?.hourlyRate > 0 && (
    <span className="ab-price__how ab-num">
      {slot.hours} {Number(slot.hours) === 1 ? "hr" : "hrs"} × {ShowPrice(slot.hourlyRate)}/hr
    </span>
  );
  const taxed = Number(slot?.taxAmount) > 0;
  return (
    <dl className="ab-price">
      {taxed && (
        <>
          <div className="ab-price__row">
            <dt>Service price{how}</dt>
            <dd className="ab-num">{ShowPrice(slot?.servicePrice)}</dd>
          </div>
          <div className="ab-price__row">
            <dt>Tax</dt>
            <dd className="ab-num">{ShowPrice(slot?.taxAmount)}</dd>
          </div>
        </>
      )}
      <div className="ab-price__row ab-price__total">
        <dt>Total (USD){!taxed && how}</dt>
        <dd className="ab-num">{ShowPrice(slot?.totalPrice)}</dd>
      </div>
    </dl>
  );
}

function ProAvatar({ pro, size = 48 }) {
  const hasImg = typeof pro?.img === "string" && pro.img.includes("http");
  return (
    <span className="ab-avatar" style={{ width: size, height: size }}>
      {hasImg ? (
        <Image src={pro.img} alt="" width={size} height={size} />
      ) : (
        <span aria-hidden="true">{initialsOf(pro?.name)}</span>
      )}
    </span>
  );
}

function ProviderSelect(props) {
  const [loading, setloading] = useState(false);
  const [Loading, setLoading] = useState(false);
  const { SlotService, fetchSlotService } = useDataStore();

  const [clientSecret, setClientSecret] = useState("");
  const [PublishableKey, setPublishableKey] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [bookError, setBookError] = useState("");
  const { service_name } = useParams() || {};
  const { push } = useRouter();
  const editTask = () => {
    const sub = props.ProviderObj?.serviceSlug;
    if (!sub || !service_name) return;
    rememberPro(sub, props.ProviderObj);
    props.handleShow?.();
    push(`/service/${service_name}/${sub}/book`);
  };
  // Closing the pop-up (✕, Esc, backdrop) on the payment step without paying releases the held time at once, instead
  // of blocking it for the 15-minute hold. Safe after paying: the server refuses once the payment has started.
  const openCheckout = useRef("");
  useEffect(() => {
    openCheckout.current = clientSecret ? bookingId : "";
  }, [clientSecret, bookingId]);
  useEffect(() => () => {
    if (openCheckout.current) ReleaseCheckoutApi({ bookingId: openCheckout.current });
  }, []);

  // "Change" on the payment step: release the held time at once and go back to the day & time picker.
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState("");
  const changeTime = () => {
    setChanging(true);
    setChangeError("");
    ReleaseCheckoutApi({ bookingId }).then((res) => {
      setChanging(false);
      // "no longer open": the 15-minute hold already ended - nothing to release, going back is still right.
      if (res?.status === 1 || /no longer open/i.test(res?.message || "")) {
        setClientSecret("");
        setBookingId("");
        formik.setFieldValue("time", "");
        loadSlots();
      } else {
        setChangeError(res?.message || "Couldn't change the time. Try again.");
      }
    });
  };
  const [priceRefreshed, setPriceRefreshed] = useState(false);

  const initialValues = {
    date: moment().format("YYYY-MM-DD") || "",
    slotId: "",
    time: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      time: TimeRequired,
      // slotId: TimeRequired,
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setloading(true);
      setBookError("");
      setPriceRefreshed(false);
      const payload = {
        scheduledDate: values.date,
        selectedSlot: values.time,
        // slotId: values.slotId,
        finalPrice: SlotService?.totalPrice,
        serviceSlug: props.ProviderObj?.venderSlug,
      };

      SlotProviderBookApi(payload).then((res) => {
        if (res?.status === 1) {
          // toast.success(res?.message);
          setClientSecret(res?.data?.paymentIntent?.client_secret);
          setPublishableKey(res?.data?.paymentIntent?.publishableKey);
          setBookingId(res?.data?.bookingId);
          props.setDateSlot({ date: values.date, slot: values.time });
          props.setHideTitle(true);
          setloading(false);
        } else {
          // Shown inline next to the button (incl. the 409 "The price has changed…").
          setBookError(res?.message || "We couldn't reserve this time. Please try again.");
          setloading(false);
        }
      });
    },
  });

  const [loadedDate, setLoadedDate] = useState("");
  const loadSlots = () => {
    setLoading(true);
    const date = formik.values.date;
    return fetchSlotService({
      serviceSlug: props.ProviderObj?.venderSlug,
      date,
    }).then(() => {
      setLoading(false);
      setLoadedDate(date);
    });
  };

  useEffect(() => {
    if (props.ProviderObj?.venderSlug && formik.values.date) {
      formik.setFieldValue("time", ""); // a time belongs to its day
      loadSlots();
    }
  }, [props.ProviderObj?.slug, formik.values.date]);

  // Open on the pro's first day with a free time (up to two weeks ahead), not on a closed "today".
  // Stops for good once a day with times is found, so the customer's own picks are never overridden.
  const lookAhead = useRef(0);
  useEffect(() => {
    if (lookAhead.current < 0 || Loading || loadedDate !== formik.values.date || SlotService?.error) return;
    const open = (SlotService?.listAvailableSlots || []).some((s) => s.isAvailable && !s.isbreak);
    if (open || lookAhead.current >= 14) {
      lookAhead.current = -1;
      return;
    }
    lookAhead.current += 1;
    formik.setFieldValue("date", moment(formik.values.date).add(1, "day").format("YYYY-MM-DD"));
  }, [SlotService, Loading, loadedDate]);

  // Same key, loaded once instead of on every render.
  const stripePromise = useMemo(
    () =>
      PublishableKey
        ? loadStripe(PublishableKey).catch(() => null)
        : Promise.resolve(null),
    [PublishableKey]
  );

  const priceChanged = bookError.startsWith("The price has changed");
  const hasPrice = SlotService?.servicePrice !== undefined;
  const slots = SlotService?.listAvailableSlots || [];

  if (clientSecret) {
    return (
      <div className="ab-pay">
        <div className="ab-pay__head">
          <h2 className="ab-modal__title">Complete your payment</h2>
          <p className="ab-pay__sub">
            Your time is held while you pay.
          </p>
        </div>
        <div className="ab-pay__grid">
          <aside className="ab-pay__summary" aria-label="Booking summary">
            <div className="ab-slot__pro">
              <ProAvatar pro={props.ProviderObj} size={40} />
              <div>
                <p className="ab-slot__proName">{props.ProviderObj?.name}</p>
                <p className="ab-slot__proMeta ab-pay__when">
                  <span>{fmtDate(formik.values.date)} · {fmtTime(formik.values.time)}</span>
                  <button type="button" className="ab-link ab-linkbtn ab-pay__change" onClick={changeTime} disabled={changing}>
                    {changing ? "Changing…" : "Change"}
                  </button>
                </p>
                {changeError && <p className="ab-error" role="alert">{changeError}</p>}
              </div>
            </div>
            <PriceRows slot={SlotService} />
          </aside>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              bookingId={bookingId}
              handleShow={props.handleShow}
              setModalType={props.setModalType}
              total={SlotService?.totalPrice}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <form className="ab-slot" onSubmit={formik.handleSubmit} noValidate>
      <div className="ab-slot__pro">
        <ProAvatar pro={props.ProviderObj} />
        <div>
          <p className="ab-slot__proName">{props.ProviderObj?.name || ""}</p>
          <p className="ab-slot__proMeta">Pick a day, then a start time.</p>
        </div>
      </div>

      <div className="ab-slot__grid">
        <div>
          <h3 className="ab-slot__label">
            Date
          </h3>
          <div className="dateCalender ab-cal">
            <DateCalender
              formik={formik}
              name="date"
              multi={false}
              value={formik.values.date}
              dateOff={
                SlotService?.offDates?.length > 0 ? SlotService?.offDates : []
              }
            />
          </div>
        </div>

        <div>
          <h3 className="ab-slot__label">
            Start time
            {formik.values.date && (
              <span className="ab-slot__labelDate">
                {fmtDate(formik.values.date)}
              </span>
            )}
          </h3>
          {Loading ? (
            <div className="ab-slot__times" aria-busy="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="ab-skeleton ab-slot__timeSk" />
              ))}
            </div>
          ) : slots.length > 0 ? (
            <div className="ab-slot__times" role="group" aria-label="Start times">
              {slots.map((item, i) => {
                const open = item?.isAvailable && !item?.isbreak;
                const picked = item?.time === formik.values.time;
                return (
                  <button
                    type="button"
                    key={`time-${i}`}
                    disabled={!open}
                    aria-pressed={picked}
                    onClick={() => {
                      if (open) {
                        // formik.setFieldValue("slotId", item?._id);
                        formik.setFieldValue("time", item?.time);
                      }
                    }}
                    className={`ab-slot__time ab-num${picked ? " is-picked" : ""}`}
                  >
                    {item?.time ? fmtTime(item.time) : "--"}
                  </button>
                );
              })}
            </div>
          ) : SlotService?.error ? (
            <div className="ab-slot__none" role="alert">
              <Icon name="alert" size={22} />
              <p>{SlotService.error}</p>
            </div>
          ) : (
            <div className="ab-slot__none">
              <Icon name="calendar" size={22} />
              <p>
                <b>No open times on this day.</b>
                <br />
                Try another date on the calendar.
              </p>
            </div>
          )}
          {showError(formik, "time") && (
            <p className="ab-error ab-slot__err">
              <Icon name="alert" size={16} /> {formik.errors.time}
            </p>
          )}
        </div>
      </div>

      <div className="ab-slot__summary">
        {SlotService?.task && (
          // A task filled in earlier is shown, never reused silently: "Edit" goes back to the task steps and the
          // same pro opens again afterwards.
          <div className="ab-slot__req ab-slot__task">
            <span className="ab-slot__reqLabel">Your task</span>
            <span className="ab-slot__reqValue">
              <span className="ab-slot__taskText">
                <span className="ab-slot__taskSize">{sizeLabel(SlotService.task.size)}</span>
                {SlotService.task.address && (
                  <span className="ab-slot__taskAddr" title={SlotService.task.address}>{SlotService.task.address}</span>
                )}
              </span>
              <button type="button" className="ab-link ab-linkbtn ab-slot__edit" onClick={editTask}>
                Edit
              </button>
            </span>
          </div>
        )}
        <div className="ab-slot__req">
          <span className="ab-slot__reqLabel">Your request</span>
          <span className="ab-slot__reqValue">
            {fmtDate(formik.values.date) || "--"}
            {formik.values.time ? ` · ${fmtTime(formik.values.time)}` : " · pick a time"}
          </span>
        </div>

        {Loading ? (
          <div className="ab-price" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="ab-skeleton ab-price__sk" />
            ))}
          </div>
        ) : hasPrice ? (
          <>
            <PriceRows slot={SlotService} />
          </>
        ) : (
          <p className="ab-slot__noPrice">
            Pick an available day to see the price.
          </p>
        )}

        {bookError && (
          <div className="ab-alert ab-slot__alert" role="alert">
            <Icon name="alert" size={20} />
            <div>
              <p className="ab-slot__alertText">{bookError}</p>
              {priceChanged && (
                <button
                  type="button"
                  className="ab-btn ab-btn--ghost ab-btn--sm ab-slot__alertBtn"
                  onClick={() => {
                    loadSlots().then(() => {
                      setBookError("");
                      setPriceRefreshed(true);
                    });
                  }}
                >
                  Refresh price
                </button>
              )}
            </div>
          </div>
        )}
        {priceRefreshed && !bookError && (
          <div className="ab-alert ab-alert--info ab-slot__alert" role="status">
            <Icon name="checkCircle" size={20} />
            <p className="ab-slot__alertText">
              Price updated. Review the new total, then continue.
            </p>
          </div>
        )}

        <button
          type="submit"
          className="ab-btn ab-btn--primary ab-btn--lg ab-btn--block"
          disabled={loading || !formik.values.time}
        >
          {loading ? (
            <Loader color="#fff" height="22" width="60" />
          ) : (
            <>
              Continue to payment
              {hasPrice && (
                <span className="ab-num ab-slot__ctaPrice">
                  {ShowPrice(SlotService?.totalPrice)}
                </span>
              )}
            </>
          )}
        </button>
        <p className="ab-slot__fine">
          You won&apos;t be charged until you
          confirm payment on the next step.
        </p>
      </div>
    </form>
  );
}

export default ProviderSelect;
