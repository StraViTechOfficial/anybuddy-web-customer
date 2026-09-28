import { FMC_TOKEN, firebaseConfig, vapidKey } from "@/Until";
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

const firebaseApp = initializeApp(firebaseConfig);

export const messaging = (async () => {
  try {
    const isSupportedBrowser = await isSupported();
    if (isSupportedBrowser) {
      return getMessaging(firebaseApp);
    }
    console.log("Firebase not supported in this browser");
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
})();

export const onMessageListener = async () =>
  new Promise((resolve) => {
    let isHandled = false; // Prevent duplicate notifications

    (async () => {
      const messagingResolve = await messaging;

      onMessage(messagingResolve, (payload) => {
        if (isHandled) return; // Skip if already handled
        isHandled = true;

        if (Notification.permission === "granted") {
          // console.log("open brower", payload.notification.title);

          const notificationTitle = payload.notification.title;
          const notificationOptions = {
            body: payload.notification.body,
            icon: "",
          };

          // console.log(notificationOptions, "notificationOptions");

          navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
              registration.showNotification(
                notificationTitle,
                notificationOptions
              );
            } else {
              console.warn(
                "No service worker registration available to show notification."
              );
            }
          });
        }
        resolve(payload);
      });
    })();
  });

export const requestForToken = async (registration) => {
  try {
    const messagingResolve = await messaging;
    if (!messagingResolve) {
      console.log("Messaging not initialized");
      return;
    }

    if (!registration) {
      console.warn("Service Worker registration missing");
      return;
    }
    const currentToken = await getToken(messagingResolve, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      // console.log("FCM Token", currentToken);
      if (Cookies.get(FMC_TOKEN) !== currentToken) {
        Cookies.set(FMC_TOKEN, currentToken, { expires: 7 });
        console.log("Token saved");
      } else {
        console.log("Token already saved");
      }
      onMessageListener(); // Call listener only if token is received
    } else {
      console.log(
        "No registration token available. Request permission to generate one."
      );
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
  }
};

// Ensure to place this in your component
<ToastContainer position="top-center" autoClose={3000} />;
