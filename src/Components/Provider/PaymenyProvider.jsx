"use client";
import { Elements } from "@stripe/react-stripe-js";
import { getDeviceInfo } from "@/Until";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import PushNotification from "../PushNotification/PushNotification";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);
function PaymenyProvider(props) {
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    // Check if window is defined (to ensure this runs on client-side)
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent; // Get the user agent from the browser
      // console.log(userAgent, "userAgent");
      const os = getDeviceInfo(userAgent);
      setDeviceInfo(os);
    }
  }, []);
  return (
    <>
      <Elements stripe={stripePromise}>{props.children}</Elements>
      {deviceInfo?.name === "Windows" || deviceInfo?.name === "Android" ? (
        <PushNotification />
      ) : null}
    </>
  );
}

export default PaymenyProvider;
