"use client";
import { requestForToken } from "@/app/firebase";
import { useEffect } from "react";

function PushNotification() {
  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      SubscribeUser();
    } else {
      console.log("Push notifications are not supported in this browser.");
    }
  }, []);

  const SubscribeUser = () => {
    try {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          registerServiceWorker();
        } else {
          console.log("Notification permission denied.");
        }
      });
    } catch (error) {
      console.error("Error during notification permission request:", error);
    }
  };

  const registerServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistration("firebase-messaging-sw.js")
        .then((existingRegistration) => {
          if (!existingRegistration) {
            navigator.serviceWorker
              .register("firebase-messaging-sw.js", {
                scope: "/",
                updateViaCache: "none",
              })
              .then(() => {
                console.log("Service Worker registered.");
                // ✅ Ensure SW is ready before requesting token
                navigator.serviceWorker.ready.then((registration) => {
                  requestForToken(registration);
                });
              })
              .catch((err) => {
                console.error("Service Worker registration failed:", err);
              });
          } else {
            console.log("Service Worker already registered.");
            // ✅ Ensure SW is ready even for existing one
            navigator.serviceWorker.ready.then((registration) => {
              requestForToken(registration);
            });
          }
        });
    }
  };

  return <></>;
}

export default PushNotification;
