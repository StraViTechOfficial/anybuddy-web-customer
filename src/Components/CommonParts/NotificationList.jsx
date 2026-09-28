"use client";
import { ClearNotificationsApi } from "@/api/setting";
import { useDataStore } from "@/api/store/store";
import "@/app/(AfterLogin)/booking/bookings.css";
import "@/app/(AfterLogin)/profile/profile.css";
import "@/Components/booking.css";
import Paginations from "@/Components/Paginations/Pagination";
import Icon from "@/Components/ui/Icon";
import { DateDisplay } from "@/Until";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";

// Real notifications for the signed-in customer (replaces the old placeholder list).
// Booking notices link to their booking. The listing call marks items read on the server, but the list it returns
// still carries read_status as it was, so this visit's new items keep their dot; the bell count is refreshed after.
function NotificationList() {
  const [Loading, setLoading] = useState(true);
  const [page, setpage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const handlePage = (val) => {
    setpage(val);
  };
  const list = useDataStore((store) => store.NotificationList);
  const { fetchNotificationList, fetchNotificationCont } = useDataStore();

  useEffect(() => {
    setLoading(true);
    fetchNotificationList({ page: page, limit: 10 }).then(() => {
      setLoading(false);
      fetchNotificationCont();
    });
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  const clearAll = async () => {
    setClearing(true);
    const res = await ClearNotificationsApi();
    setClearing(false);
    if (res?.status !== 1) {
      toast.error(res?.message || "We couldn't clear your notifications. Please try again.");
      return;
    }
    setConfirmOpen(false);
    setpage(1);
    useDataStore.setState({ NotificationList: { data: [], count: 0 } });
    fetchNotificationCont();
  };

  if (Loading) {
    return (
      <ul className="ab-notes" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="ab-note" aria-hidden="true">
            <span className="ab-skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
            <div className="ab-note__body" style={{ display: "grid", gap: 8 }}>
              <span className="ab-skeleton" style={{ height: 14, width: "40%" }} />
              <span className="ab-skeleton" style={{ height: 12, width: "85%" }} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!(list?.data?.length > 0)) {
    return (
      <div className="ab-empty">
        <span className="ab-empty__icon">
          <Icon name="bell" size={28} />
        </span>
        <h3>You&apos;re all caught up</h3>
        <p>Booking confirmations, schedule changes and messages from Any-Buddy will show up here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="ab-notes__bar">
        <button type="button" className="ab-notes__clear" onClick={() => setConfirmOpen(true)}>
          Clear all
        </button>
      </div>
      <ul className="ab-notes">
        {list.data.map((item, i) => {
          const unread = item?.read_status === 0;
          const slug = item?.bookingSlug;
          const Row = slug ? Link : "div";
          return (
            <li key={`noti-${item?._id || i}`}>
              <Row
                className={`ab-note${unread ? " ab-note--unread" : ""}`}
                {...(slug ? { href: `/booking/${encodeURIComponent(slug)}` } : {})}
              >
                <span className="ab-note__icon">
                  <Icon name="bell" size={18} />
                </span>
                <div className="ab-note__body">
                  <div className="ab-note__top">
                    <p className="ab-note__title">
                      {unread && (
                        <>
                          <span className="ab-note__dot" aria-hidden="true" />
                          <span className="visually-hidden">New: </span>
                        </>
                      )}
                      {item?.title || "Notification"}
                    </p>
                    {item?.createdAt && (
                      <time className="ab-note__time" dateTime={item.createdAt}>
                        {DateDisplay(item.createdAt)}
                      </time>
                    )}
                  </div>
                  {item?.message && <p className="ab-note__msg">{item.message}</p>}
                  {slug && (
                    <span className="ab-note__cta">
                      View booking <Icon name="arrowRight" size={14} />
                    </span>
                  )}
                </div>
              </Row>
            </li>
          );
        })}
      </ul>
      {list?.count > 10 && (
        <div className="ab-notes__pager">
          <Paginations page={page} total={list?.count} handlePage={handlePage} />
        </div>
      )}

      <Modal
        show={confirmOpen}
        onHide={() => !clearing && setConfirmOpen(false)}
        centered
        dialogClassName="ab-modal"
        aria-labelledby="ab-notes-clear-title"
      >
        <Modal.Header closeButton className="ab-modal__head">
          <h2 className="ab-modal__title" id="ab-notes-clear-title">
            Clear all notifications
          </h2>
        </Modal.Header>
        <Modal.Body className="ab-modal__body">
          <p className="ab-mform__intro">They&apos;ll be removed from this list. New updates will still appear here.</p>
          <div className="ab-notes__confirm">
            <button type="button" className="ab-btn ab-btn--light" onClick={() => setConfirmOpen(false)} disabled={clearing}>
              Cancel
            </button>
            <button type="button" className="ab-btn ab-btn--danger" onClick={clearAll} disabled={clearing}>
              Clear all
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NotificationList;
