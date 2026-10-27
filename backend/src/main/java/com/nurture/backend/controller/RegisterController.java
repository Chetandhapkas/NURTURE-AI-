package com.nurture.backend.controller;

import com.nurture.backend.dto.RegisterRequest;
import com.nurture.backend.repository.LoginRepository;
import com.nurture.backend.service.EmailService;
import com.nurture.backend.service.OtpService;
import com.nurture.backend.service.RegisterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // ===========================
    // TEST API
    // ===========================

    @GetMapping("/test")
    public ResponseEntity<String> test() {

        System.out.println("TEST API CALLED");

        return ResponseEntity.ok("Backend connected successfully");
    }

    // ===========================
    // SEND OTP API
    // ===========================

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(
            @RequestBody RegisterRequest request) {

        System.out.println("EMAIL RECEIVED : " + request.getEmail());

        // Check whether email already exists
        if (loginRepository.findByEmail(request.getEmail()).isPresent()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email already exists");
        }

        System.out.println("EMAIL CHECK PASSED");

        // Generate OTP
        String otp = otpService.generateOtp(request.getEmail());

        System.out.println("OTP GENERATED : " + otp);

        // Send OTP to email
        emailService.sendOtp(request.getEmail(), otp);

        System.out.println("EMAIL SENT SUCCESSFULLY");

        // Send response to frontend
        return ResponseEntity.ok("OTP sent successfully");
    }

    // ===========================
    // REGISTER API
    // ===========================

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request) {

        String result = registerService.register(request);

        if ("Registration Successful".equals(result)) {

            return ResponseEntity.ok(result);
        }

        return ResponseEntity
                .badRequest()
                .body(result);
    }
}