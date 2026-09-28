"use client";
import Icon from "@/Components/ui/Icon";
import moment from "moment";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import "../booking.css";

function SuccessModal(props) {
  const { push } = useRouter();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (seconds === 0) {
      push("/booking");
    }
    const timer = setInterval(() => {
      if (seconds > 0) setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const date = props.DateSlot?.date
    ? moment(props.DateSlot?.date, "YYYY-MM-DD").format("dddd, MMMM D, YYYY")
    : "";
  const time = props.DateSlot?.slot
    ? moment(props.DateSlot?.slot, "HH:mm").format("h:mm A")
    : "";

  return (
    <div className="ab-done" role="status">
      <span className="ab-done__mark" aria-hidden="true">
        <Icon name="check" size={34} stroke={2.25} />
      </span>
      <h2 className="ab-done__title">You&apos;re all booked</h2>
      <p className="ab-done__text">
        Payment received. You&apos;ll find the details and updates in your
        bookings.
      </p>
      {(date || time) && (
        <div className="ab-done__when">
          {date && (
            <span>
              <Icon name="calendar" size={16} /> {date}
            </span>
          )}
          {time && (
            <span className="ab-num">
              <Icon name="clock" size={16} /> {time}
            </span>
          )}
        </div>
      )}
      <button
        onClick={() => {
          props.handleShow();
          push("/booking");
        }}
        className="ab-btn ab-btn--primary ab-btn--lg ab-done__cta"
      >
        Go to my bookings
        <Icon name="arrowRight" size={18} className="ab-arrow" />
      </button>
      <p className="ab-done__redirect" aria-live="polite">
        Taking you there in <span className="ab-num">{seconds}</span>{" "}
        {seconds === 1 ? "second" : "seconds"}…
      </p>
    </div>
  );
}

export default SuccessModal;
