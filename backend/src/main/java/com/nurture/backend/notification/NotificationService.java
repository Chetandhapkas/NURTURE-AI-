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

    @Transactional
    public boolean sendNotification(
            Long userId,
            String type,
            Long referenceId,
            String title,
            String body
    ) {

        if (historyRepository
                .existsByUserIdAndNotificationTypeAndReferenceId(
                        userId,
                        type,
                        referenceId
                )) {

            System.out.println(
                    "Notification already sent: "
                            + type
                            + " / "
                            + referenceId
            );

            return false;
        }

        List<NotificationToken> tokens =
                tokenRepository.findByUserIdAndActiveTrue(userId);

        if (tokens.isEmpty()) {

            System.out.println(
                    "No active notification token found for user: "
                            + userId
            );

            return false;
        }

        boolean sentSuccessfully = false;

        for (NotificationToken token : tokens) {

            try {

                Notification notification =
                        Notification.builder()
                                .setTitle(title)
                                .setBody(body)
                                .build();

                Message message =
                        Message.builder()
                                .setToken(token.getToken())
                                .setNotification(notification)
                                .putData("type", type)
                                .putData("referenceId",
                                        String.valueOf(referenceId))
                                .build();

                String response =
                        FirebaseMessaging
                                .getInstance()
                                .send(message);

                System.out.println(
                        "Notification sent successfully: "
                                + response
                );

                sentSuccessfully = true;

            } catch (Exception e) {

                System.out.println(
                        "Failed to send notification to token: "
                                + token.getId()
                );

                System.out.println(
                        "Reason: "
                                + e.getMessage()
                );

                /*
                 * If Firebase says that the token is invalid,
                 * deactivate it so we don't keep trying.
                 */
                String message = e.getMessage();

                if (message != null &&
                        (message.contains("registration-token-not-registered")
                                || message.contains("UNREGISTERED")
                                || message.contains("INVALID_ARGUMENT"))) {

                    token.setActive(false);
                    tokenRepository.save(token);
                }
            }
        }

        if (sentSuccessfully) {

            NotificationHistory history =
                    new NotificationHistory();

            history.setUserId(userId);
            history.setNotificationType(type);
            history.setReferenceId(referenceId);

            historyRepository.save(history);

            return true;
        }

        return false;
    }
}