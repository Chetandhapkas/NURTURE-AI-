
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

// Firebase configuration
firebase.initializeApp({
  apiKey: "AIzaSyCb_UOUPXmfb9QjtRBH8MkE8aWcpktEldI",
  authDomain: "nurture-ai-76d00.firebaseapp.com",
  projectId: "nurture-ai-76d00",
  storageBucket: "nurture-ai-76d00.firebasestorage.app",
  messagingSenderId: "874838406504",
  appId: "1:874838406504:web:ceb1aa2139779be40752dd"
});

const messaging = firebase.messaging();

// =====================================================
// BACKGROUND NOTIFICATIONS
// =====================================================

messaging.onBackgroundMessage((payload) => {

  console.log(
    "Background notification received:",
    payload
  );

  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    "Nurture AI";

  const notificationBody =
    payload.notification?.body ||
    payload.data?.body ||
    "You have a new pregnancy wellness reminder.";

  const notificationOptions = {

    body: notificationBody,

    icon: "/favicon.ico",

    badge: "/favicon.ico",

    data: {
      url: payload.data?.url || "/"
    }
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// =====================================================
// NOTIFICATION CLICK
// =====================================================

self.addEventListener(
  "notificationclick",
  (event) => {

    console.log(
      "Notification clicked"
    );

    event.notification.close();

    const targetUrl =
      event.notification.data?.url || "/";

    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })

      .then((clientList) => {

        for (const client of clientList) {

          if ("focus" in client) {

            client.navigate(targetUrl);

            return client.focus();
          }
        }

        if (clients.openWindow) {

          return clients.openWindow(
            targetUrl
          );
        }

      })

    );
  }
);

