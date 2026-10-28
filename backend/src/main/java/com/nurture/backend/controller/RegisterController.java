
package com.nurture.backend.controller;

import com.nurture.backend.dto.RegisterRequest;
import com.nurture.backend.repository.LoginRepository;
import com.nurture.backend.service.EmailService;
import com.nurture.backend.service.OtpService;
import com.nurture.backend.service.RegisterService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class RegisterController {

    private final RegisterService registerService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final LoginRepository loginRepository;

    public RegisterController(
            RegisterService registerService,
            OtpService otpService,
            EmailService emailService,
            LoginRepository loginRepository) {

        this.registerService = registerService;
        this.otpService = otpService;
        this.emailService = emailService;
        this.loginRepository = loginRepository;
    }

    // TEST API
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend connected successfully");
    }

    // SEND REGISTRATION OTP
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @RequestBody RegisterRequest request) {

        String email = request.getEmail();

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is required"));
        }

        email = email.trim().toLowerCase();

        if (loginRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already exists"));
        }

        String otp = otpService.generateOtp(email);

        try {
            emailService.sendRegistrationOtp(email, otp);

            System.out.println("Registration OTP email sent successfully.");

            return ResponseEntity.ok(
                    Map.of("message", "OTP sent successfully")
            );

        } catch (Exception e) {
            System.err.println("Failed to send registration OTP email.");
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "message",
                            "Unable to send OTP email. Please try again later."
                    ));
        }
    }

    // REGISTER API
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request) {

        String result = registerService.register(request);

        if ("Registration Successful".equals(result)) {
            return ResponseEntity.ok(result);
        }

        return ResponseEntity.badRequest().body(result);
    }
}
