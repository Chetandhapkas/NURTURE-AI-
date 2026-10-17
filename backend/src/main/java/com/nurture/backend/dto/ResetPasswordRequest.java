package com.nurture.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "Reset token is required")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(
            min = 6,
            max = 72,
            message = "Password must be between 8 and 72 characters"
    )
    private String newPassword;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;
}