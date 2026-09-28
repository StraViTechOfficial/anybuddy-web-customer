importScripts(
  "https://www.gstatic.com/firebasejs/9.9.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.9.0/firebase-messaging-compat.js"
);

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBp1p0H0Y3qIJkQDCRjuGmdnGH-lUdiIB0",
  authDomain: "any-buddy.firebaseapp.com",
  projectId: "any-buddy",
  storageBucket: "any-buddy.firebasestorage.app",
  messagingSenderId: "1014974926067",
  appId: "1:1014974926067:web:cf58150f1a75d54e19fb86",
};
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Listen for background messages
// messaging.onBackgroundMessage((payload) => {
//   // console.log(
//   //   "[firebase-messaging-sw.js] Received background message",
//   //   payload
//   // );
//   if (!self.registration.active) return;
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: "/assets/images/pushIcon.png",
//   };
//   // console.log(notificationOptions, " Received background notificationOptions ");
//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

// Handle notification clicks
// self.addEventListener("notificationclick", (event) => {
//   // console.log("Notification click event:", event);
//   event.notification.close(); // Close the notification

//   // Open a specific URL when notification is clicked
//   event.waitUntil(
//     clients.openWindow(`https://www.deliverit.net.in/order`) // Replace with your app's URL
//   );
// });
