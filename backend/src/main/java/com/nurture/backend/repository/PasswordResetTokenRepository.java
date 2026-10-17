package com.nurture.backend.repository;

import com.nurture.backend.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHashAndUsedAtIsNull(
            String tokenHash
    );

    List<PasswordResetToken> findAllByUserIdAndUsedAtIsNull(
            Long userId
    );
}