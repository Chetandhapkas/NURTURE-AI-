package com.nurture.backend.repository;

import com.nurture.backend.entity.NotificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationTokenRepository
        extends JpaRepository<NotificationToken, Long> {

    Optional<NotificationToken> findByToken(String token);

    List<NotificationToken> findByUserIdAndActiveTrue(Long userId);

    List<NotificationToken> findByUserId(Long userId);

    boolean existsByToken(String token);
}