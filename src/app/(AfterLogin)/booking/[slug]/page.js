"use client";
import { useDataStore } from "@/api/store/store";
import CommanModal from "@/Components/Modals/CommanModal";
import Icon from "@/Components/ui/Icon";
import { ShowPrice } from "@/Until";
import moment from "moment";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import {
  PAYMENT_STATUS,
  ProviderAvatar,
  StatusPill,
  cancelNote,
  providerName,
  refundNote,
  whenParts,
} from "../BookingStatus";
import "../bookings.css";

const hm = (t) => moment(t).format("h:mm A");

// Progress comes from the status code plus the job day times: onTheWayAt (and etaMinutes) when the Buddy sets off,
// and checkInAt when the start code is used.
function steps(b) {
  const status = b?.status;
  const booked = {
    label: "Booked",
    note: b?.createdAt ? moment(b.createdAt).format("MMM D, h:mm A") : "",
    state: "done",
    icon: "check",
  };
  if (status === 4) return [booked, { label: "Cancelled", state: "stop", icon: "x" }];
  if (status === 5) return [booked, { label: "Rejected", note: "Your Buddy declined", state: "stop", icon: "x" }];
  const live = status === 2 && !b?.checkOutAt;
  const way = b?.checkInAt
    ? { label: "In progress", note: `Started ${hm(b.checkInAt)}`, state: status === 3 ? "done" : "current", icon: status === 3 ? "check" : "briefcase" }
    : b?.onTheWayAt && live
      ? { label: "On the way", note: `Arriving about ${hm(moment(b.onTheWayAt).add(Number(b.etaMinutes) || 0, "minutes"))}`, state: "current", icon: "pin" }
      : { label: "On the way", state: status === 3 ? "done" : "pending", icon: status === 3 ? "check" : "pin" };
  return [
    booked,
    {
      // Named for what happens at this stage: the Buddy accepts or declines the request. "Scheduled" sounded as if it were
      // already done.
      label: status >= 2 ? "Confirmed" : "Waiting for your Buddy",
      note: status >= 2 ? "Your Buddy accepted the booking" : "Your Buddy will accept or decline shortly",
      state: status >= 2 ? "done" : "current",
      icon: status >= 2 ? "check" : "clock",
    },
    way,
    {
      label: "Completed",
      state: status === 3 ? "done" : live && !b?.onTheWayAt && !b?.checkInAt ? "current" : "pending",
      icon: status === 3 ? "check" : "checkCircle",
    },
  ];
}

function Photos({ title, list, onOpen }) {
  if (!list?.length) return null;
  return (
    <div className="ab-panel">
      <h3 className="ab-panel__title">
        <Icon name="eye" size={20} />
        {title}
        {list[0]?.uploadedAt && (
          <span className="ab-muted" style={{ fontWeight: 500, fontSize: "var(--ab-fs-sm)" }}>
            {moment(list[0].uploadedAt).format("MMM D, h:mm A")}
          </span>
        )}
      </h3>
      <div className="ab-bkd__photos">
        {list.map((slide, i) => (
          <button
            type="button"
            key={`work_iag-${i}`}
            className="ab-bkd__photo"
            aria-label={`${title}: open photo ${i + 1}`}
            onClick={() => onOpen(list.map((item) => ({ src: item?.url })))}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.url} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingDetail() {
  const { slug } = useParams();
  const { BookingDetail, fetchBookingDetail } = useDataStore();
  const [Loading, setLoading] = useState(true);
  const [BookingId, setBookingId] = useState("");
  const [ServiceId, setServiceId] = useState("");
  const [VenderId, setVenderId] = useState("");
  const [ModalName, setModalName] = useState("");
  const [ModalType, setModalType] = useState("");
  const [show, setShow] = useState(false);
  const handleShow = () => {
    setShow(!show);
  };

  const params = {
    bookingSlug: slug,
  };

  useEffect(() => {
    setLoading(true);
    fetchBookingDetail(params).then(() => {
      setLoading(false);
    });
  }, [slug]);

  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState([]);
  const openPhotos = (s) => {
    setSlides(s);
    setOpen(true);
  };

  const b = BookingDetail?.booking_detail;
  const v = b?.vendor;

  // While the booking is live, refresh quietly so "On the way", the codes and "In progress" appear without a reload.
  const liveStatus = b?.status === 1 || b?.status === 2;
  useEffect(() => {
    if (!liveStatus) return;
    const t = setInterval(() => fetchBookingDetail(params), 30000);
    return () => clearInterval(t);
  }, [slug, liveStatus]);
  const { date, range } = whenParts(b);
  const name = providerName(v);
  const rating = Number(v?.averageRating) || 0;
  const tax = Number(b?.taxAmount) || 0;
  const total = Number(b?.price) || 0;
  const flow = steps(b);
  // Minutes between check-in and check-out, or hoursWorked from the API when only that is sent.
  const worked = b?.checkInAt && b?.checkOutAt
    ? moment(b.checkOutAt).diff(moment(b.checkInAt), "minutes")
    : Math.round((Number(b?.hoursWorked) || 0) * 60);

  return (
    <>
      <section className="ab-section ab-section--tight">
        <div className="ab-container">
          {Loading ? (
            <div className="ab-bkd" aria-busy="true">
              <div className="ab-bkd__main">
                <div className="ab-panel" style={{ display: "grid", gap: 14 }}>
                  <span className="ab-skeleton" style={{ height: 28, width: "55%" }} />
                  <span className="ab-skeleton" style={{ height: 14, width: "35%" }} />
                  <span className="ab-skeleton" style={{ height: 64, width: "100%" }} />
                </div>
                <div className="ab-panel" style={{ display: "grid", gap: 14 }}>
                  <span className="ab-skeleton" style={{ height: 18, width: "30%" }} />
                  <span className="ab-skeleton" style={{ height: 14, width: "80%" }} />
                  <span className="ab-skeleton" style={{ height: 14, width: "70%" }} />
                </div>
              </div>
              <div className="ab-panel" style={{ display: "grid", gap: 14 }}>
                <span className="ab-skeleton" style={{ height: 18, width: "40%" }} />
                <span className="ab-skeleton" style={{ height: 14, width: "100%" }} />
                <span className="ab-skeleton" style={{ height: 14, width: "100%" }} />
                <span className="ab-skeleton" style={{ height: 48, width: "100%" }} />
              </div>
              <span className="visually-hidden">Loading booking</span>
            </div>
          ) : !b?._id ? (
            <div className="ab-empty" style={{ maxWidth: 720, marginInline: "auto" }}>
              <span className="ab-empty__icon">
                <Icon name="receipt" size={28} />
              </span>
              <h3>This booking could not be found</h3>
              <p>The link may be out of date. Your current bookings are all listed on the bookings page.</p>
              <Link href="/booking" className="ab-btn ab-btn--primary" style={{ marginTop: 8 }}>
                Go to my bookings
              </Link>
            </div>
          ) : (
            <div className="ab-bkd">
              <div className="ab-bkd__main">
                {/* Summary and progress */}
                <div className="ab-panel ab-bkd__summary">
                  <div className="ab-bkd__summaryTop">
                    <div style={{ minWidth: 0 }}>
                      {b?.categoryName && (
                        <p className="ab-bkcard__cat">{b.categoryName}</p>
                      )}
                      <h1 className="ab-bkd__svc">{b?.services?.serviceName || "Service"}</h1>
                    </div>
                    <StatusPill status={b?.status} by={b?.cancelledBy} />
                  </div>
                  {b?.bookingId && (
                    <p className="ab-bkd__ids">
                      Booking <span className="ab-num">#{b.bookingId}</span>
                    </p>
                  )}
                  <ol className="ab-timeline" style={{ "--n": flow.length }} aria-label="Booking progress">
                    {flow.map((s) => (
                      <li
                        key={s.label}
                        className={`ab-step ab-step--${s.state}`}
                        aria-current={s.state === "current" ? "step" : undefined}
                      >
                        <span className="ab-step__dot">
                          <Icon name={s.icon} size={16} stroke={2.25} />
                        </span>
                        <span>
                          <b>{s.label}</b>
                          {s.note}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {b?.status === 4 && (
                  <div className="ab-panel ab-bkd__cancelled">
                    <h3 className="ab-panel__title">
                      <Icon name="alert" size={20} />
                      {b?.cancelledBy === "provider" ? "Declined by your Buddy" : "Cancelled"}
                    </h3>
                    <p className="ab-bkd__note">{cancelNote(b)}</p>
                    {refundNote(b) && <p className="ab-bkd__note">{refundNote(b)}</p>}
                  </div>
                )}

                {/* The job code. The contract says the Buddy needs the customer's code to start and to finish the job. It
                    shows only while a code is live, and a new one is sent for the finish. */}
                {b?.jobCode && (
                  <div className="ab-panel ab-jobcode" role="status">
                    {b?.jobCodeStage === "finish" ? (
                      <>
                        <p className="ab-jobcode__label">Finish code</p>
                        <p className="ab-jobcode__code ab-num">{b.jobCode}</p>
                        <p className="ab-jobcode__note">
                          Give it to your Buddy when the job is done. It closes the booking; your start code no longer
                          works.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="ab-jobcode__label">Start code</p>
                        <p className="ab-jobcode__code ab-num">{b.jobCode}</p>
                        <p className="ab-jobcode__note">
                          Give it to your Buddy when they arrive to start the job. You&apos;ll get a new code to finish.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Visit details */}
                <div className="ab-panel">
                  <h3 className="ab-panel__title">
                    <Icon name="calendar" size={20} />
                    Visit details
                  </h3>
                  <dl className="ab-rows">
                    <div>
                      <Icon name="calendar" size={18} />
                      <dt>Date</dt>
                      <dd>{date || "To be confirmed"}</dd>
                    </div>
                    {range && (
                      <div>
                        <Icon name="clock" size={18} />
                        <dt>Time</dt>
                        <dd className="ab-num">
                          {range}
                          {b?.timeInterval && (
                            <span className="ab-muted"> · {b.timeInterval} {Number(b.timeInterval) === 1 ? "hr" : "hrs"}</span>
                          )}
                        </dd>
                      </div>
                    )}
                    {b?.checkInAt && (
                      <div>
                        <Icon name="clock" size={18} />
                        <dt>Checked in</dt>
                        <dd className="ab-num">{moment(b.checkInAt).format("h:mm A")}</dd>
                      </div>
                    )}
                    {b?.checkOutAt && (
                      <div>
                        <Icon name="clock" size={18} />
                        <dt>Checked out</dt>
                        <dd className="ab-num">{moment(b.checkOutAt).format("h:mm A")}</dd>
                      </div>
                    )}
                    {worked > 0 && (
                      <div>
                        <Icon name="clock" size={18} />
                        <dt>Time on the job</dt>
                        <dd className="ab-num">
                          {Math.floor(worked / 60)} h {worked % 60} m
                        </dd>
                      </div>
                    )}
                    <div>
                      <Icon name="pin" size={18} />
                      <dt>{b?.endAddress ? "Start location" : "Address"}</dt>
                      <dd>{b?.address || "Not provided"}</dd>
                    </div>
                    {b?.endAddress && (
                      <div>
                        <Icon name="pin" size={18} />
                        <dt>End location</dt>
                        <dd>{b.endAddress}</dd>
                      </div>
                    )}
                    {b?.vehicle && (
                      <div>
                        <Icon name="briefcase" size={18} />
                        <dt>Vehicle</dt>
                        <dd style={{ textTransform: "capitalize" }}>{b.vehicle}</dd>
                      </div>
                    )}
                    {b?.createdAt && (
                      <div>
                        <Icon name="receipt" size={18} />
                        <dt>Booked on</dt>
                        <dd>{moment(b.createdAt).format("MMM D, YYYY [at] h:mm A")}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {b?.userDesc && (
                  <div className="ab-panel">
                    <h3 className="ab-panel__title">
                      <Icon name="chat" size={20} />
                      Your notes for the Buddy
                    </h3>
                    <p className="ab-bkd__note">{b.userDesc}</p>
                  </div>
                )}

                <Photos title="Check-in photos" list={b?.checkInImages} onOpen={openPhotos} />
                <Photos title="Check-out photos" list={b?.checkOutImages} onOpen={openPhotos} />
              </div>

              <aside className="ab-bkd__rail">
                {/* Receipt */}
                <div className="ab-panel ab-receipt">
                  <h3 className="ab-panel__title">
                    <Icon name="receipt" size={20} />
                    Receipt
                  </h3>
                  <dl className="ab-receipt__lines">
                    <div>
                      <dt>
                        <span style={{ textTransform: "capitalize" }}>
                          {b?.services?.serviceName || "Service"}
                        </span>
                        {b?.services?.price && b?.timeInterval && (
                          <small className="ab-num">
                            {ShowPrice(b.services.price)} × {b.timeInterval} {Number(b.timeInterval) === 1 ? "hr" : "hrs"}
                          </small>
                        )}
                      </dt>
                      <dd className="ab-num">{ShowPrice(total - tax)}</dd>
                    </div>
                    <div>
                      <dt>Tax{b?.taxPercentage ? ` (${b.taxPercentage}%)` : ""}</dt>
                      <dd className="ab-num">{ShowPrice(tax)}</dd>
                    </div>
                    <div className="ab-receipt__total">
                      <dt>Total</dt>
                      <dd className="ab-num">{ShowPrice(total)}</dd>
                    </div>
                  </dl>
                  <p className="ab-receipt__pay">
                    <Icon name="card" size={18} />
                    {PAYMENT_STATUS[b?.payment_status] || "Payment status unavailable"}
                  </p>
                  {/* A review is for a finished visit only. */}
                  {b?.status === 3 && !b?.ratingDone ? (
                    <button
                      type="button"
                      className="ab-btn ab-btn--primary ab-btn--block"
                      onClick={() => {
                        setModalName("open modal");
                        setModalType("Rating Review");
                        setServiceId(b?.services?._id);
                        setVenderId(v?._id);
                        setBookingId(b?._id);
                        handleShow();
                      }}
                    >
                      <Icon name="star" size={18} />
                      Leave a review
                    </button>
                  ) : (
                    b?.rating && (
                      <p className="ab-receipt__rated">
                        <Icon name="star" size={18} />
                        You rated this visit <b className="ab-num">{b.rating}/5</b>
                      </p>
                    )
                  )}
                </div>

                {/* The Buddy */}
                <div className="ab-panel">
                  <h3 className="ab-panel__title">
                    <Icon name="user" size={20} />
                    Your Buddy
                  </h3>
                  <div className="ab-bkd__pro">
                    <ProviderAvatar vendor={v} size={56} />
                    <div style={{ minWidth: 0 }}>
                      <p className="ab-bkd__proName">{name || "Not assigned yet"}</p>
                      <p className="ab-bkd__rating">
                        <Icon name="star" size={16} />
                        {rating > 0 ? (
                          <span className="ab-num">{rating.toFixed(1)} average rating</span>
                        ) : (
                          "No reviews yet"
                        )}
                      </p>
                    </div>
                  </div>
                  {(v?.phone || v?.email) && (
                    <ul className="ab-bkd__contact">
                      {v?.phone && (
                        <li>
                          <a href={`tel:${v?.countryCode || ""}${v.phone}`}>
                            <Icon name="phone" size={18} />
                            <span className="ab-num">
                              {v?.countryCode} {v.phone}
                            </span>
                          </a>
                        </li>
                      )}
                      {v?.email && (
                        <li>
                          <a href={`mailto:${v.email}`}>
                            <Icon name="mail" size={18} />
                            {v.email}
                          </a>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </aside>
            </div>
          )}
          <Lightbox
            open={open}
            close={() => setOpen(false)}
            slides={slides}
            plugins={[Zoom]}
          />
        </div>
      </section>
      {show && ModalName === "open modal" && (
        <CommanModal
          show={show}
          handleShow={handleShow}
          ModalType={ModalType}
          setModalType={setModalType}
          ServiceId={ServiceId}
          VenderId={VenderId}
          BookingId={BookingId}
          apiCall={fetchBookingDetail}
          params={params}
        />
      )}
    </>
  );
}

export default BookingDetail;
