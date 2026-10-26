
package com.nurture.backend.repository;

import com.nurture.backend.entity.NotificationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationHistoryRepository
        extends JpaRepository<NotificationHistory, Long> {

    boolean existsByUserIdAndNotificationTypeAndReferenceId(
            Long userId,
            String notificationType,
            Long referenceId
    );

    List<NotificationHistory> findByUserIdOrderBySentAtDesc(Long userId);
}
