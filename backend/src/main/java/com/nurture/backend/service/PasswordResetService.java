package com.nurture.backend.service;

import com.nurture.backend.dto.ResetPasswordRequest;
import com.nurture.backend.entity.Login;
import com.nurture.backend.entity.PasswordResetToken;
import com.nurture.backend.repository.LoginRepository;
import com.nurture.backend.repository.PasswordResetTokenRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class PasswordResetService {

    private static final Logger log =
            LoggerFactory.getLogger(PasswordResetService.class);

    private static final int TOKEN_EXPIRY_MINUTES = 15;

    private final LoginRepository loginRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String mailUsername;

    public PasswordResetService(
            LoginRepository loginRepository,
            PasswordResetTokenRepository tokenRepository,
            JavaMailSender mailSender
    ) {
        this.loginRepository = loginRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
    }

    // REQUEST PASSWORD RESET
    @Transactional
    public void requestPasswordReset(String email) {

        if (email == null || email.isBlank()) {
            return;
        }

        Login user = loginRepository
                .findByEmail(email.trim())
                .orElse(null);

        // Do not disclose whether an account exists.
        if (user == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        // Invalidate previously issued unused tokens.
        for (PasswordResetToken oldToken :
                tokenRepository.findAllByUserIdAndUsedAtIsNull(
                        user.getId())) {

            oldToken.setUsedAt(now);
        }

        tokenRepository.flush();

        // Generate a cryptographically secure token.
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setTokenHash(hashToken(rawToken));
        resetToken.setCreatedAt(now);
        resetToken.setExpiresAt(
                now.plusMinutes(TOKEN_EXPIRY_MINUTES)
        );

        tokenRepository.saveAndFlush(resetToken);

        String baseUrl = frontendUrl.replaceAll("/+$", "");

        String resetLink = baseUrl
                + "/reset-password?token="
                + rawToken;

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(mailUsername);
        message.setTo(user.getEmail());
        message.setSubject("Reset Your NURTURE AI Password");

        message.setText(
                "Hello " + user.getFullName() + ",\n\n"
                        + "We received a request to reset your NURTURE AI password.\n\n"
                        + "Use the link below to choose a new password:\n"
                        + resetLink + "\n\n"
                        + "This link expires in "
                        + TOKEN_EXPIRY_MINUTES + " minutes and can be used only once.\n\n"
                        + "If you did not request this reset, you can ignore this email.\n\n"
                        + "NURTURE AI Team"
        );

        try {
            mailSender.send(message);
        } catch (MailException exception) {

            // Invalidate the token if the email could not be sent.
            resetToken.setUsedAt(LocalDateTime.now());
            tokenRepository.save(resetToken);

            // Never log the reset token or password.
            log.error(
                    "Password reset email delivery failed for the account."
            );
        }
    }

    // RESET PASSWORD
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        if (!request.getNewPassword().equals(
                request.getConfirmPassword())) {
            throw new IllegalArgumentException(
                    "Passwords do not match."
            );
        }

        String tokenHash = hashToken(request.getToken());

        PasswordResetToken resetToken = tokenRepository
                .findByTokenHashAndUsedAtIsNull(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException(
                        "This reset link is invalid or has expired. "
                                + "Please request a new link."
                ));

        LocalDateTime now = LocalDateTime.now();

        if (!resetToken.getExpiresAt().isAfter(now)) {
            resetToken.setUsedAt(now);
            tokenRepository.save(resetToken);

            throw new IllegalArgumentException(
                    "This reset link is invalid or has expired. "
                            + "Please request a new link."
            );
        }

        Login user = loginRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "This reset link is invalid. Please request a new one."
                ));

        // Store the new password as a BCrypt hash.
        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        loginRepository.save(user);

        // A token can never be reused.
        resetToken.setUsedAt(now);
        tokenRepository.save(resetToken);

        // Invalidate any other outstanding reset links.
        for (PasswordResetToken otherToken :
                tokenRepository.findAllByUserIdAndUsedAtIsNull(
                        user.getId())) {

            otherToken.setUsedAt(now);
        }
    }

    private String hashToken(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "Unable to process password reset token.",
                    exception
            );
        }
    }
}