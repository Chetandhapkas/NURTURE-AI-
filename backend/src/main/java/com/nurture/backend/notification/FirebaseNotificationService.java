package com.nurture.backend.notification;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

@Service
public class FirebaseNotificationService {

    private final FirebaseApp firebaseApp;

    public FirebaseNotificationService(FirebaseApp firebaseApp) {
        this.firebaseApp = firebaseApp;
    }

    public String sendNotification(
            String token,
            String title,
            String body
    ) {

        try {

            Notification notification =
                    Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build();

            Message message =
                    Message.builder()
                            .setToken(token)
                            .setNotification(notification)
                            .putData("url", "/")
                            .build();

            String response =
                    FirebaseMessaging
                            .getInstance(firebaseApp)
                            .send(message);

            System.out.println(
                    "FCM notification sent successfully: "
                            + response
            );

            return response;

        } catch (Exception e) {

            System.err.println(
                    "FCM notification failed: "
                            + e.getMessage()
            );

            throw new RuntimeException(
                    "Failed to send notification",
                    e
            );
        }
    }
}