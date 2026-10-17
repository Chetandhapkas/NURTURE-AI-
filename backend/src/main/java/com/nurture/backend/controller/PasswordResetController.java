package com.nurture.backend.controller;

import com.nurture.backend.dto.ForgotPasswordRequest;
import com.nurture.backend.dto.ResetPasswordRequest;
import com.nurture.backend.service.PasswordResetService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://10.157.64.217:5173"
        },
        allowCredentials = "true"
)
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(
            PasswordResetService passwordResetService
    ) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        passwordResetService.requestPasswordReset(
                request.getEmail()
        );

        // Same response whether the email exists or not.
        return ResponseEntity.ok(Map.of(
                "message",
                "If an account exists for that email, "
                        + "a password reset link will be sent."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        try {
            passwordResetService.resetPassword(request);

            return ResponseEntity.ok(Map.of(
                    "message",
                    "Password reset successful. You can now log in."
            ));

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "message",
                            exception.getMessage()
                    ));
        }
    }
}