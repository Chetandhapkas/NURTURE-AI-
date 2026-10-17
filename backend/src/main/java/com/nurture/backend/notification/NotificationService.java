package com.nurture.backend.notification;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.nurture.backend.entity.NotificationHistory;
import com.nurture.backend.entity.NotificationToken;
import com.nurture.backend.repository.NotificationHistoryRepository;
import com.nurture.backend.repository.NotificationTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationTokenRepository tokenRepository;
    private final NotificationHistoryRepository historyRepository;

    public NotificationService(
            NotificationTokenRepository tokenRepository,
            NotificationHistoryRepository historyRepository
    ) {
        this.tokenRepository = tokenRepository;
        this.historyRepository = historyRepository;
    }

    /*
     * =====================================================
     * SEND NOTIFICATION
     * =====================================================
     */
    @Transactional
    public boolean sendNotification(
            Long userId,
            String type,
            Long referenceId,
            String title,
            String body
    ) {

        System.out.println();
        System.out.println(
                "=========================================="
        );

        System.out.println(
                "Notification Service Started"
        );

        System.out.println(
                "User ID       : " + userId
        );

        System.out.println(
                "Type          : " + type
        );

        System.out.println(
                "Reference ID  : " + referenceId
        );

        System.out.println(
                "Title         : " + title
        );

        /*
         * =====================================================
         * CHECK DUPLICATE
         * =====================================================
         */
        if (historyRepository
                .existsByUserIdAndNotificationTypeAndReferenceId(
                        userId,
                        type,
                        referenceId
                )) {

            System.out.println(
                    "Notification already sent."
            );

            System.out.println(
                    "Type: " + type
                            + " | Reference ID: "
                            + referenceId
            );

            System.out.println(
                    "=========================================="
            );

            return false;
        }

        /*
         * =====================================================
         * FIND ACTIVE FCM TOKENS
         * =====================================================
         */
        List<NotificationToken> tokens =
                tokenRepository.findByUserIdAndActiveTrue(userId);

        System.out.println(
                "Active FCM tokens found: "
                        + tokens.size()
        );

        if (tokens.isEmpty()) {

            System.out.println(
                    "NO ACTIVE FCM TOKEN FOUND"
            );

            System.out.println(
                    "User ID: " + userId
            );

            System.out.println(
                    "=========================================="
            );

            return false;
        }

        boolean sentSuccessfully = false;

        /*
         * =====================================================
         * SEND TO EVERY ACTIVE TOKEN
         * =====================================================
         */
        for (NotificationToken token : tokens) {

            try {

                System.out.println(
                        "Sending notification to token ID: "
                                + token.getId()
                );

                Notification notification =
                        Notification.builder()
                                .setTitle(title)
                                .setBody(body)
                                .build();

                Message message =
                        Message.builder()
                                .setToken(token.getToken())
                                .setNotification(notification)
                                .putData(
                                        "type",
                                        type
                                )
                                .putData(
                                        "referenceId",
                                        String.valueOf(referenceId)
                                )
                                .build();

                String response =
                        FirebaseMessaging
                                .getInstance()
                                .send(message);

                System.out.println(
                        "Firebase response: "
                                + response
                );

                System.out.println(
                        "Notification sent successfully."
                );

                sentSuccessfully = true;

            } catch (Exception e) {

                System.err.println(
                        "FAILED TO SEND NOTIFICATION"
                );

                System.err.println(
                        "Token ID: "
                                + token.getId()
                );

                System.err.println(
                        "Reason: "
                                + e.getMessage()
                );

                /*
                 * =================================================
                 * INVALID TOKEN
                 * =================================================
                 */
                String message =
                        e.getMessage();

                if (message != null &&
                        (
                                message.contains(
                                        "registration-token-not-registered"
                                )
                                        ||
                                        message.contains(
                                                "UNREGISTERED"
                                        )
                                        ||
                                        message.contains(
                                                "INVALID_ARGUMENT"
                                        )
                        )) {

                    System.out.println(
                            "Invalid FCM token detected."
                    );

                    System.out.println(
                            "Deactivating token ID: "
                                    + token.getId()
                    );

                    token.setActive(false);

                    tokenRepository.save(token);
                }
            }
        }

        /*
         * =====================================================
         * SAVE NOTIFICATION HISTORY
         * =====================================================
         */
        if (sentSuccessfully) {

            NotificationHistory history =
                    new NotificationHistory();

            history.setUserId(userId);

            history.setNotificationType(
                    type
            );

            history.setReferenceId(
                    referenceId
            );

            historyRepository.save(
                    history
            );

            System.out.println(
                    "Notification history saved."
            );

            System.out.println(
                    "Notification process SUCCESS."
            );

            System.out.println(
                    "=========================================="
            );

            return true;
        }

        System.out.println(
                "Notification process FAILED."
        );

        System.out.println(
                "=========================================="
        );

        return false;
    }
}   