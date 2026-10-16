import Icon from "@/Components/ui/Icon";
import { ShowPrice } from "@/Until";
import moment from "moment";

// Booking status codes as the API returns them (models/user/booking.js). These are the customer tabs.
// 5 is an unpaid checkout, never shown. A pro's decline is a cancelled booking with cancelledBy "provider".
export const BOOKING_STATUS = {
  1: { label: "Requested", icon: "clock", tone: "info" }, // paid, waiting for the Buddy to accept
  2: { label: "Confirmed", icon: "calendar", tone: "info" }, // the Buddy accepted
  3: { label: "Completed", icon: "checkCircle", tone: "success" },
  4: { label: "Cancelled", icon: "x", tone: "danger" },
};
const DECLINED = { label: "Declined", icon: "alert", tone: "danger" };

export const PAYMENT_STATUS = {
  0: "Payment pending",
  1: "Payment processing",
  2: "Paid",
  3: "Payment cancelled",
  4: "Refunded",
};

export function StatusPill({ status, by }) {
  const s = Number(status) === 4 && by === "provider" ? DECLINED : BOOKING_STATUS[Number(status)];
  if (!s) return null;
  return (
    <span className={`ab-status ab-status--${s.tone}`}>
      <Icon name={s.icon} size={14} stroke={2} />
      {s.label}
    </span>
  );
}

const time = (t) => (t ? moment(t, "HH:mm").format("h:mm A") : "");

// "Tue, Oct 6, 2026" and "9:00 AM – 11:00 AM" from the booking fields.
export function whenParts(b) {
  const date = b?.scheduledDate ? moment(b.scheduledDate).format("ddd, MMM D, YYYY") : "";
  const range = [time(b?.selectedSlot), time(b?.endTime)].filter(Boolean).join(" – ");
  return { date, range };
}

export function providerName(v) {
  return v?.firstName ? `${v.firstName} ${v.lastName || ""}`.trim() : "";
}

export function ProviderAvatar({ vendor, size = 48 }) {
  const name = providerName(vendor);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="ab-avatar" style={{ width: size, height: size, fontSize: size * 0.34 }}>
      {vendor?.logoUrl?.includes("http") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={vendor.logoUrl} alt="" />
      ) : (
        initials || <Icon name="user" size={size * 0.45} />
      )}
    </span>
  );
}

// Why a cancelled booking was cancelled, in the customer's words.
export function cancelNote(b) {
  if (Number(b?.status) !== 4 && !b?.cancelledBy) return "";
  const who = b?.cancelledBy === "provider" ? "Declined by your Buddy" : b?.cancelledBy === "customer" ? "You cancelled" : "Cancelled";
  return b?.cancelReason ? `${who}: ${b.cancelReason}` : who;
}

// Where the money is after a cancel (refundStatus is Stripe's refund status, kept current by the webhook).
export function refundNote(b) {
  const amount = ShowPrice(b?.refundAmount || b?.price);
  if (b?.refundStatus === "succeeded") return `${amount} refunded to your card.`;
  if (b?.refundStatus === "pending") return `Your ${amount} refund is on its way to your card. It usually shows in 5–10 business days.`;
  if (b?.refundStatus === "failed" || b?.refundStatus === "canceled") return `Your ${amount} refund is delayed. We're sorting it out; contact support if you have questions.`;
  return "";
}

// Free cancellation (backend rule): any time while requested, and up to 24 hours before an accepted visit.
// ponytail: start is read in the browser's time zone; the backend checks in New York time and has the last word.
export function canCancel(b) {
  if (Number(b?.status) === 1) return true;
  if (Number(b?.status) !== 2 || b?.checkInAt || !b?.scheduledDate || !b?.selectedSlot) return false;
  const start = moment(`${moment(b.scheduledDate).format("YYYY-MM-DD")} ${b.selectedSlot}`, "YYYY-MM-DD HH:mm");
  return start.diff(moment(), "hours", true) >= 24;
}
