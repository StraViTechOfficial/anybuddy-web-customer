"use client";
import Icon from "@/Components/ui/Icon";
import "@/Components/booking.css";

function LeftMenuBooking(props) {
  const steps = props.LinksArr?.filter((fd) => fd?.checked) || [];
  return (
    <nav className="ab-steps" aria-label="Booking steps">
      <ol>
        {steps.map((item, i) => {
          const done = props.Type > item?.id;
          const current = props.Type === item?.id;
          return (
            <li
              key={`nevLijl-${i}`}
              className={`ab-steps__item${done ? " is-done" : ""}${
                current ? " is-current" : ""
              }`}
              aria-current={current ? "step" : undefined}
            >
              <span className="ab-steps__dot ab-num" aria-hidden="true">
                {done ? <Icon name="check" size={16} stroke={2.25} /> : i + 1}
              </span>
              <span className="ab-steps__text">
                <span className="ab-steps__name">{item?.name}</span>
                <span className="ab-steps__state">
                  {done ? "Done" : current ? "In progress" : "Up next"}
                </span>
              </span>
              {done && props.EditShow && (
                <button
                  type="button"
                  className="ab-steps__edit"
                  aria-label={`Edit ${item?.name}`}
                  onClick={() => {
                    props.setType(item?.id);
                    props.setTitle(item?.name);
                    if (props.isTabletOrMobile) {
                      props.handleShow();
                    }
                  }}
                >
                  Edit
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default LeftMenuBooking;
