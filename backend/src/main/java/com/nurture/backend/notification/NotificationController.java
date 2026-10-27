
package com.nurture.backend.notification;

import com.nurture.backend.entity.NotificationToken;
import com.nurture.backend.repository.NotificationTokenRepository;
import com.nurture.backend.repository.NotificationHistoryRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")

public class NotificationController {

    private final NotificationTokenRepository tokenRepository;
    private final NotificationHistoryRepository historyRepository;
    private final NotificationService notificationService;

    public NotificationController(
            NotificationTokenRepository tokenRepository,
            NotificationService notificationService,
            NotificationHistoryRepository historyRepository
    ) {
        this.tokenRepository = tokenRepository;
        this.notificationService = notificationService;
        this.historyRepository = historyRepository;
    }

    // GET NOTIFICATION HISTORY
    // GET /api/notifications/history/{userId}
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getNotificationHistory(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                historyRepository.findByUserIdOrderBySentAtDesc(userId)
        );
    }

    // SAVE OR UPDATE BROWSER FCM TOKEN
    // POST /api/notifications/token
    @PostMapping("/token")
    public ResponseEntity<?> saveToken(
            @RequestBody Map<String, Object> request
    ) {
        Object userIdObject = request.get("userId");
        Object tokenObject = request.get("token");

        if (userIdObject == null || tokenObject == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "userId and token are required"
            ));
        }

        Long userId;

        try {
            userId = Long.parseLong(userIdObject.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid userId"
            ));
        }

        String token = tokenObject.toString().trim();

        if (token.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Token cannot be empty"
            ));
        }

        Optional<NotificationToken> existing =
                tokenRepository.findByToken(token);

        if (existing.isPresent()) {
            NotificationToken notificationToken = existing.get();

            notificationToken.setUserId(userId);
            notificationToken.setActive(true);

            tokenRepository.save(notificationToken);

            System.out.println("FCM token updated for user: " + userId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification token updated"
            ));
        }

        NotificationToken notificationToken = new NotificationToken();
        notificationToken.setUserId(userId);
        notificationToken.setToken(token);
        notificationToken.setActive(true);

        tokenRepository.save(notificationToken);

        System.out.println("New FCM token saved for user: " + userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification token saved"
        ));
    }

    // DISABLE BROWSER FCM TOKEN
    // POST /api/notifications/token/deactivate
    @PostMapping("/token/deactivate")
    public ResponseEntity<?> deactivateToken(
            @RequestBody Map<String, String> request
    ) {
        String token = request.get("token");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Token is required"
            ));
        }

        Optional<NotificationToken> existing =
                tokenRepository.findByToken(token);

        if (existing.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Token not found"
            ));
        }

        NotificationToken notificationToken = existing.get();
        notificationToken.setActive(false);
        tokenRepository.save(notificationToken);

        System.out.println("FCM token deactivated");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification disabled"
        ));
    }

    // SEND TEST NOTIFICATION
    // POST /api/notifications/test/{userId}
    @PostMapping("/test/{userId}")
    public ResponseEntity<?> sendTestNotification(
            @PathVariable Long userId
    ) {
        List<NotificationToken> tokens =
                tokenRepository.findByUserIdAndActiveTrue(userId);

        if (tokens.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "No active notification token found for this user",
                    "userId", userId
            ));
        }

        Long testReferenceId = System.currentTimeMillis();

        boolean sent = notificationService.sendNotification(
                userId,
                "TEST",
                testReferenceId,
                "Nurture AI 🔔",
                "Test notification received successfully!"
        );

        if (sent) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Test notification sent successfully",
                    "sent", true,
                    "totalTokens", tokens.size()
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "Notification could not be sent",
                "sent", false,
                "totalTokens", tokens.size()
        ));
    }
}
