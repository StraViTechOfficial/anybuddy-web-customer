"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);
// Browser notifications are off (owner, 1 Oct 2026): customers get email + in-app notices; the apps use push.
function PaymenyProvider(props) {
  return <Elements stripe={stripePromise}>{props.children}</Elements>;
}

export default PaymenyProvider;
