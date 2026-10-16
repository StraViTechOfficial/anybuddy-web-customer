"use client";
import { BookingCancelApi } from "@/api/setting";
import { useDataStore } from "@/api/store/store";
import CommanModal from "@/Components/Modals/CommanModal";
import Paginations from "@/Components/Paginations/Pagination";
import Icon from "@/Components/ui/Icon";
import { ShowPrice } from "@/Until";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  BOOKING_STATUS,
  canCancel,
  cancelNote,
  refundNote,
  PAYMENT_STATUS,
  ProviderAvatar,
  StatusPill,
  providerName,
  whenParts,
} from "./BookingStatus";
import "./bookings.css";

// The empty state text for each tab. It says what will appear here, then points to /service.
const EMPTY = {
  1: {
    icon: "calendar",
    title: "No requests waiting",
    text: "After you book and pay, the booking waits here until your Buddy accepts it.",
  },
  2: {
    icon: "clock",
    title: "No confirmed bookings yet",
    text: "Once your Buddy confirms a booking, it moves here so you can see exactly when they're coming.",
  },
  3: {
    icon: "checkCircle",
    title: "No completed bookings yet",
    text: "After a visit wraps up, you'll find the receipt here and can leave a review.",
  },
  4: {
    icon: "x",
    title: "No cancelled bookings",
    text: "Bookings you cancel, and requests a Buddy declines, are kept here for your records.",
  },
};

function BookingPage() {
  const [Tab, setTab] = useState("1");
  const [page, setpage] = useState(1);
  const handlePage = (val) => {
    setpage(val);
  };
  const [BookingId, setBookingId] = useState("");
  const [ModalName, setModalName] = useState("");
  const [ModalType, setModalType] = useState("");
  const [show, setShow] = useState(false);
  const handleShow = () => {
    setShow(!show);
  };

  const [Loading, setLoading] = useState(true);
  const { BookingList, fetchBookingList } = useDataStore();
  const params = {
    page: page,
    limit: 10,
    status: Tab,
  };

  useEffect(() => {
    setLoading(true);
    fetchBookingList(params).then(() => {
      setLoading(false);
    });
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page, Tab]);

  // An old return address from a payment that left the site, from before /booking/return existed. Send it there.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("bookingId") && q.get("payment_intent")) window.location.replace(`/booking/return${window.location.search}`);
  }, []);

  const cencelBooking = (reson) => {
    setLoading(true);
    BookingCancelApi({ bookingId: BookingId, cancelReason: reson }).then(
      (res) => {
        if (res?.status === 1) {
          toast.success("Booking cancelled. Your refund is on its way back to how you paid; it usually shows in 5–10 business days.");
          fetchBookingList(params).then(() => {
            setLoading(false);
          });
        } else {
          toast.error(res?.message);
          setLoading(false);
        }
      },
    );
  };

  const list = BookingList?.data || [];
  const empty = EMPTY[Tab];

  return (
    <>
      <section className="ab-section ab-section--tight ab-bk">
        <div className="ab-container">
          <div className="ab-bk__tabs" role="tablist" aria-label="Booking status">
            {Object.entries(BOOKING_STATUS).map(([key, s]) => (
              <button
                key={key}
                type="button"
                role="tab"
                id={`bk-tab-${key}`}
                aria-selected={Tab === key}
                aria-controls="bk-panel"
                className="ab-bk__tab"
                onClick={() => {
                  setTab(key);
                  setpage(1);
                }}
              >
                <Icon name={s.icon} size={16} />
                {s.label}
              </button>
            ))}
          </div>

          <div id="bk-panel" role="tabpanel" aria-labelledby={`bk-tab-${Tab}`} aria-busy={Loading}>
            {Loading ? (
              <div className="ab-bk__grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="ab-bkcard ab-bkcard--skeleton" aria-hidden="true">
                    <span className="ab-skeleton" style={{ height: 14, width: "30%" }} />
                    <span className="ab-skeleton" style={{ height: 22, width: "65%" }} />
                    <div className="ab-bkcard__pro">
                      <span className="ab-skeleton" style={{ width: 44, height: 44, borderRadius: "50%" }} />
                      <span className="ab-skeleton" style={{ height: 14, width: "40%" }} />
                    </div>
                    <span className="ab-skeleton" style={{ height: 14, width: "80%" }} />
                    <span className="ab-skeleton" style={{ height: 14, width: "70%" }} />
                    <span className="ab-skeleton" style={{ height: 44, width: "100%" }} />
                  </div>
                ))}
                <span className="visually-hidden">Loading bookings</span>
              </div>
            ) : list.length > 0 ? (
              <div className="ab-bk__grid">
                {list.map((item, i) => {
                  const { date, range } = whenParts(item);
                  const name = providerName(item?.vendor);
                  return (
                    <article className="ab-bkcard" key={`boking-${i}`}>
                      <header className="ab-bkcard__top">
                        <div className="ab-bkcard__titles">
                          {item?.categoryName && (
                            <p className="ab-bkcard__cat">{item.categoryName}</p>
                          )}
                          <h3 className="ab-bkcard__svc">
                            {item?.services?.serviceName || "Service"}
                          </h3>
                        </div>
                        <StatusPill status={Tab} by={item?.cancelledBy} />
                      </header>

                      <div className="ab-bkcard__pro">
                        <ProviderAvatar vendor={item?.vendor} size={44} />
                        <div>
                          <p className="ab-bkcard__label">Your Buddy</p>
                          <p className="ab-bkcard__name">{name || "Not assigned yet"}</p>
                        </div>
                      </div>

                      <ul className="ab-bkcard__meta">
                        <li>
                          <Icon name="calendar" size={18} />
                          <span>
                            {date || "Date to be confirmed"}
                            {range && <span className="ab-bkcard__sub ab-num">{range}</span>}
                          </span>
                        </li>
                        {item?.address && (
                          <li>
                            <Icon name="pin" size={18} />
                            <span className="ab-bkcard__addr">{item.address}</span>
                          </li>
                        )}
                        {Tab === "4" && cancelNote({ ...item, status: 4 }) && (
                          <li>
                            <Icon name="alert" size={18} />
                            <span>{cancelNote({ ...item, status: 4 })}</span>
                          </li>
                        )}
                        {Tab === "4" && refundNote(item) && (
                          <li>
                            <Icon name="card" size={18} />
                            <span>{refundNote(item)}</span>
                          </li>
                        )}
                      </ul>

                      <footer className="ab-bkcard__foot">
                        <div>
                          <p className="ab-bkcard__total ab-num">{ShowPrice(item?.price)}</p>
                          <p className="ab-bkcard__pay">
                            {PAYMENT_STATUS[item?.payment_status] || "Payment status unavailable"}
                            {item?.bookingId && (
                              <span className="ab-num"> · #{item.bookingId}</span>
                            )}
                          </p>
                        </div>
                        <div className="ab-bkcard__actions">
                          {(Tab === "1" || Tab === "2") && canCancel({ ...item, status: Number(Tab) }) && (
                            <button
                              type="button"
                              className="ab-bk__cancel"
                              onClick={() => {
                                setModalName("open modal");
                                setModalType("cancel Booking");
                                setBookingId(item?._id);
                                handleShow();
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          <Link
                            href={`/booking/${item?.slug}`}
                            className="ab-btn ab-btn--ghost ab-btn--sm"
                          >
                            View details
                            <Icon name="arrowRight" size={16} className="ab-arrow" />
                          </Link>
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="ab-empty ab-bk__empty">
                <span className="ab-empty__icon">
                  <Icon name={empty.icon} size={28} />
                </span>
                <h3>{empty.title}</h3>
                <p>{empty.text}</p>
                <Link href="/service" className="ab-btn ab-btn--primary" style={{ marginTop: 8 }}>
                  Browse services
                  <Icon name="arrowRight" size={18} className="ab-arrow" />
                </Link>
              </div>
            )}
          </div>

          {!Loading && list.length > 0 && BookingList?.count > 10 && (
            <div className="ab-bk__pager">
              <Paginations
                page={page}
                total={BookingList?.count}
                handlePage={handlePage}
              />
            </div>
          )}
        </div>
      </section>
      {show && ModalName === "open modal" && (
        <CommanModal
          show={show}
          handleShow={handleShow}
          ModalType={ModalType}
          setModalType={setModalType}
          cencelBooking={cencelBooking}
        />
      )}
    </>
  );
}

export default BookingPage;
