"use client";
// The customer comes back here after a payment that left the site (Cash App Pay). Stripe adds payment_intent,
// payment_intent_client_secret and redirect_status to the return_url set in CheckoutForm. The result is shown exactly
// as for a card payment: the same success screen, or the same payment step (with the time still held) and the error
// at the top.
import { ConfirmPaymentApi, ReleaseCheckoutApi } from "@/api/setting";
import CommanModal from "@/Components/Modals/CommanModal";
import { PaymentStep } from "@/Components/Forms/ProviderSelect/ProviderSelect";
import Icon from "@/Components/ui/Icon";
import { clearCheckout, readCheckout, rememberPro } from "@/Until/bookingTask";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const POLLS = 5; // While Stripe says "processing", ask the server this many times, 3 seconds apart, before saying it is still being confirmed.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const NOTES = {
  confirming: { title: "Your payment is being confirmed…", text: "This takes a few seconds." },
  refunded: { title: "That time is no longer free", text: "Your payment is being refunded. It usually shows in 5–10 business days." },
  pending: { title: "Your payment is still being confirmed", text: "It will show in your bookings shortly." },
  released: { title: "Payment didn't go through", text: "Your held time was released and nothing was charged. Pick a time again to book." },
  failed: { title: "Payment didn't go through", text: "Nothing was charged. Go back to the service to book again." },
};

export default function PaymentReturnPage() {
  const { push, replace } = useRouter();
  const [view, setView] = useState("confirming");
  const [ctx, setCtx] = useState(null);
  const [pay, setPay] = useState(null); // { bookingId, clientSecret, notice } for the payment step
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState("");

  // While the payment step is open the time is held. Leaving it (with ✕, the backdrop or another page) releases the
  // time at once, just as closing the checkout pop-up does.
  const held = useRef("");
  useEffect(() => () => {
    if (held.current) ReleaseCheckoutApi({ bookingId: held.current });
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const bookingId = q.get("bookingId");
    const clientSecret = q.get("payment_intent_client_secret");
    if (!bookingId) return replace("/booking");
    const saved = readCheckout(bookingId); // This is null in another browser or tab.
    setCtx(saved);

    const confirm = () => ConfirmPaymentApi({ bookingId }).then((res) => res?.data || {});
    const paid = () => {
      clearCheckout();
      setView("success");
    };

    (async () => {
      let status = q.get("redirect_status");
      let intent = null;
      if (saved?.publishableKey && clientSecret) {
        const stripe = await loadStripe(saved.publishableKey).catch(() => null);
        intent = (await stripe?.retrievePaymentIntent(clientSecret).catch(() => null))?.paymentIntent;
        if (intent) status = intent.status;
      }

      if (status === "succeeded") {
        // Same as a card payment: the server records it now. If the time was taken in the meantime, the payment is refunded instead.
        const r = await confirm().catch(() => ({}));
        return r.status === "cancelled" ? setView("refunded") : paid();
      }
      if (status === "processing") {
        for (let i = 0; i < POLLS; i++) {
          const r = await confirm().catch(() => ({}));
          if (r.paid) return paid();
          if (r.status === "cancelled") return setView("refunded");
          if (i < POLLS - 1) await wait(3000);
        }
        return setView("pending");
      }

      // The payment failed or was cancelled. Without the saved step (or the secret) the step can't be rebuilt, so offer to
      // book again.
      if (!saved || !clientSecret) return setView("failed");
      // The payment intent can be reused after a failed attempt unless it was cancelled, and the booking must still hold
      // the time.
      const r = await ConfirmPaymentApi({ bookingId }).catch(() => ({}));
      if (intent?.status === "canceled" || r?.data?.status === "cancelled" || /not found/i.test(r?.message || "")) {
        return setView("released");
      }
      const cashapp = saved.method === "cashapp" || intent?.last_payment_error?.payment_method?.type === "cashapp";
      held.current = bookingId;
      setPay({
        bookingId,
        clientSecret,
        notice: cashapp
          ? "Cash App payment didn't go through. Try again, or pay by card."
          : "Your payment didn't go through. Try again, or choose another way to pay.",
      });
      setView("pay");
    })();
  }, []);

  const backHref = ctx?.returnPath || "/service";

  // "Change" releases the held time now and reopens this Buddy's day and time picker on the service page.
  const changeTime = () => {
    setChanging(true);
    setChangeError("");
    ReleaseCheckoutApi({ bookingId: pay.bookingId }).then((res) => {
      if (res?.status === 1 || /no longer open/i.test(res?.message || "")) {
        held.current = "";
        clearCheckout();
        rememberPro(backHref.split("/").pop(), ctx.pro);
        push(backHref);
      } else {
        setChanging(false);
        setChangeError(res?.message || "Couldn't change the time. Try again.");
      }
    });
  };

  const close = () => {
    if (view === "released" && ctx?.pro) rememberPro(backHref.split("/").pop(), ctx.pro); // Reopen this Buddy's open times.
    push(view === "pay" || view === "released" || view === "failed" ? backHref : "/booking");
  };
  const note = NOTES[view];

  return (
    <>
      <section className="ab-section" style={{ minHeight: "60vh" }} />
      <CommanModal
        show
        handleShow={close}
        ModalType={view === "success" ? "Success" : "payment"}
        DateSlot={ctx ? { date: ctx.date, slot: ctx.time } : ""}
      >
        {view === "pay" && (
          <PaymentStep
            pro={ctx.pro}
            date={ctx.date}
            time={ctx.time}
            slot={ctx.slot}
            bookingId={pay.bookingId}
            clientSecret={pay.clientSecret}
            publishableKey={ctx.publishableKey}
            returnPath={ctx.returnPath}
            notice={pay.notice}
            onChange={changeTime}
            changing={changing}
            changeError={changeError}
            handleShow={close}
            setModalType={() => {
              held.current = "";
              clearCheckout();
              setView("success");
            }}
          />
        )}
        {note && (
          <div className="ab-done" role="status" aria-busy={view === "confirming"}>
            <h2 className="ab-done__title">{note.title}</h2>
            <p className="ab-done__text">{note.text}</p>
            {view !== "confirming" && (
              <button type="button" onClick={close} className="ab-btn ab-btn--primary ab-btn--lg ab-done__cta">
                {view === "released" ? "Pick a time" : view === "failed" ? "Book again" : "Go to my bookings"}
                <Icon name="arrowRight" size={18} className="ab-arrow" />
              </button>
            )}
          </div>
        )}
      </CommanModal>
    </>
  );
}
