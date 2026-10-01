import { useState, useEffect } from "react";

import { getToken, onMessage } from "firebase/messaging";

import {
  getFirebaseMessaging,
  VAPID_KEY
} from "../../firebase/firebase.js";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "/api";

export default function NotificationPermission() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [permission, setPermission] = useState(
    "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  // Listen for Firebase notifications while website is open
  useEffect(() => {
    let unsubscribe;

    const setupForegroundListener = async () => {
      try {
        if (!("Notification" in window)) {
          console.log(
            "❌ Browser does not support notifications."
          );
          return;
        }

        if (Notification.permission !== "granted") {
          console.log(
            "⚠️ Notification permission is not granted."
          );
          return;
        }

        console.log(
          "🔔 Setting up Firebase foreground listener..."
        );

        const messaging =
          await getFirebaseMessaging();

        unsubscribe = onMessage(
          messaging,
          (payload) => {
            console.log(
              "🔥 FCM MESSAGE RECEIVED:",
              payload
            );

            const title =
              payload.notification?.title ||
              payload.data?.title ||
              "Nurture AI";

            const body =
              payload.notification?.body ||
              payload.data?.body ||
              "You have a new reminder.";

            console.log(
              "Notification title:",
              title
            );

            console.log(
              "Notification body:",
              body
            );

            if (Notification.permission === "granted") {
              const notification =
                new Notification(title, {
                  body: body,
                  icon: "/favicon.ico"
                });

              notification.onclick = () => {
                window.focus();
                notification.close();
              };

              console.log(
                "✅ Browser notification displayed."
              );
            }
          }
        );

        console.log(
          "✅ Firebase foreground listener ready."
        );

      } catch (error) {
        console.error(
          "❌ Foreground notification error:",
          error
        );
      }
    };

    setupForegroundListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Enable browser and Firebase notifications
  const enableNotifications = async () => {
    try {
      setLoading(true);

      setStatus(
        "Requesting notification permission..."
      );

      if (!("Notification" in window)) {
        throw new Error(
          "Your browser does not support notifications."
        );
      }

      if (!("serviceWorker" in navigator)) {
        throw new Error(
          "Your browser does not support service workers."
        );
      }

      const userId =
        localStorage.getItem("userId");

      if (!userId) {
        throw new Error(
          "Please log in first."
        );
      }

      console.log(
        "Current userId:",
        userId
      );

      const permissionResult =
        await Notification.requestPermission();

      console.log(
        "Notification permission:",
        permissionResult
      );

      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        setStatus(
          "Permission denied. Enable notifications in browser settings."
        );
        return;
      }

      setStatus(
        "Registering notification service..."
      );

      const registration =
        await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

      console.log(
        "✅ Service worker registered:",
        registration
      );

      await navigator.serviceWorker.ready;

      console.log(
        "✅ Service worker ready."
      );

      const messaging =
        await getFirebaseMessaging();

      console.log(
        "✅ Firebase messaging initialized."
      );

      const token = await getToken(
        messaging,
        {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration:
            registration
        }
      );

      console.log(
        "FCM Token:",
        token
      );

      if (!token) {
        throw new Error(
          "Unable to generate Firebase notification token."
        );
      }

      setStatus(
        "Connecting to Nurture AI server..."
      );

      const response = await fetch(
        `${API_BASE}/notifications/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: Number(userId),
            token: token
          })
        }
      );

      console.log(
        "Backend token response:",
        response.status
      );

      if (!response.ok) {
        throw new Error(
          `Backend error: ${response.status}`
        );
      }

      const result =
        await response.json();

      console.log(
        "Backend response:",
        result
      );

      setStatus(
        "Notifications enabled successfully!"
      );

    } catch (error) {
      console.error(
        "❌ Notification setup error:",
        error
      );

      setStatus(
        error.message ||
          "Failed to enable notifications."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notification-card">
      <div className="notification-icon">
        🔔
      </div>

      <h3>
        Stay Connected with Nurture AI
      </h3>

      <p>
        Enable notifications to receive
        pregnancy reminders, medicine alerts,
        appointment updates, and wellness
        notifications.
      </p>

      <button
        onClick={enableNotifications}
        disabled={
          loading ||
          permission === "unsupported"
        }
      >
        {loading
          ? "Enabling Notifications..."
          : permission === "granted"
            ? "Enable / Refresh Notifications"
            : "Allow Notifications"}
      </button>

      {status && (
        <p role="status">
          {status}
        </p>
      )}

      {permission === "denied" && (
        <p>
          Notifications are blocked in your
          browser. Please allow them through
          site settings.
        </p>
      )}
    </div>
  );
}