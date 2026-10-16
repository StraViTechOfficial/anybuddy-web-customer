"use client";

import { useEffect, useRef, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import Loader from "@/Components/Loader/Loader";
import Icon from "@/Components/ui/Icon";
import { ConfirmPaymentApi } from "@/api/setting";
import { ShowPrice } from "@/Until";
import { saveCheckout } from "@/Until/bookingTask";
import "../../booking.css";

// How long to wait for Stripe's card form before offering a retry.
const LOAD_TIMEOUT_MS = 15000;

export default function CheckoutForm(props) {
  const { push } = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [payError, setPayError] = useState("");
  // Set by /booking/return after a payment that left the site didn't go through; cleared on the next try.
  const [notice, setNotice] = useState(props.notice || "");
  const method = useRef(""); // the chosen tab (card, cashapp, …), so the return page can name it

  useEffect(() => {
    if (ready || loadError) return;
    const t = setTimeout(() => setLoadError(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [ready, loadError, attempt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setPayError("");
    setNotice("");
    // For a method that leaves the site: /booking/return rebuilds this step (or the success screen) from it.
    saveCheckout({
      ...props.checkout,
      returnPath: props.checkout?.returnPath || window.location.pathname, // the service page, to book again
      bookingId: props.bookingId,
      method: method.current,
    });

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Only for methods that leave the page (Cash App Pay): Stripe sends the customer back here with payment_intent,
        // payment_intent_client_secret and redirect_status added; /booking/return shows the result like a card payment.
        return_url: `${window.location.origin}/booking/return?bookingId=${encodeURIComponent(props.bookingId)}`,
        // Required by Stripe when the country field is hidden.
        payment_method_data: { billing_details: { address: { country: "US" } } },
      },
      redirect: "if_required",
    });

    if (error) {
      setPayError(error.message);
    } else if (paymentIntent?.status === "succeeded") {
      // Ask our server to check with Stripe now, so the booking is marked paid even when Stripe's webhook is late
      // (or can't reach a local test server). Never blocks the success screen.
      await ConfirmPaymentApi({ bookingId: props.bookingId }).catch(() => {});
      props.setModalType("Success");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="ab-card-form" noValidate>
      {/* One plain label and one trust line under the button (the four stacked reassurances and an
          icon on every label read as generated). */}
      <p className="ab-card-form__title">Payment</p>

      {notice && (
        <div className="ab-alert ab-card-form__alert" role="alert">
          <Icon name="alert" size={20} />
          <p className="ab-card-form__alertText">{notice}</p>
        </div>
      )}

      {loadError ? (
        <div className="ab-alert ab-card-form__alert" role="alert">
          <Icon name="alert" size={20} />
          <div>
            <p className="ab-card-form__alertTitle">
              The secure card form didn&apos;t load.
            </p>
            <p className="ab-card-form__alertText">
              Check your connection and try again. Your time is still held and
              nothing has been charged.
            </p>
            <button
              type="button"
              className="ab-btn ab-btn--ghost ab-btn--sm"
              onClick={() => {
                setLoadError(false);
                setReady(false);
                setAttempt((a) => a + 1);
              }}
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <>
          {!ready && (
            <div className="ab-card-form__sk" aria-busy="true" aria-label="Loading card form">
              <span className="ab-skeleton ab-card-form__skTabs" />
              <span className="ab-skeleton ab-card-form__skLabel" />
              <span className="ab-skeleton ab-card-form__skField" />
              <div className="ab-card-form__skRow">
                <span className="ab-skeleton ab-card-form__skField" />
                <span className="ab-skeleton ab-card-form__skField" />
              </div>
            </div>
          )}
          <div className={ready ? "" : "ab-card-form__pending"}>
            <PaymentElement
              key={attempt}
              // Stripe shows every method the server allows (card, Cash App Pay; Apple Pay / Google Pay where the device
              // has them - Apple Pay only on the verified https domain). US only: no country picker; ZIP stays for card checks.
              options={{
                layout: "tabs",
                // Apple Pay / Google Pay stay automatic; Link's sign-up block (email, phone, name) is hidden - it made
                // the step scroll and pre-filled India.
                wallets: { applePay: "auto", googlePay: "auto", link: "never" },
                fields: { billingDetails: { address: { country: "never" } } },
              }}
              onChange={(e) => (method.current = e.value?.type || "")}
              onReady={() => setReady(true)}
              onLoadError={() => setLoadError(true)}
            />
          </div>
        </>
      )}

      {payError && (
        <div className="ab-alert ab-card-form__alert" role="alert">
          <Icon name="alert" size={20} />
          <p className="ab-card-form__alertText">{payError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !ready}
        className="ab-btn ab-btn--primary ab-btn--lg ab-btn--block"
      >
        {loading ? (
          <Loader color="#fff" height="22" width="60" />
        ) : (
          <>
            Pay{" "}
            {props.total !== undefined && (
              <span className="ab-num">{ShowPrice(props.total)}</span>
            )}
          </>
        )}
      </button>
      <p className="ab-card-form__fine">
        Payments are processed by Stripe. Any-Buddy never sees your full card number.
      </p>
    </form>
  );
}
