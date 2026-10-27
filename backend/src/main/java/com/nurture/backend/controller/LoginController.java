package com.nurture.backend.controller;

import com.nurture.backend.dto.LoginRequest;
import com.nurture.backend.dto.LoginResponse;
import com.nurture.backend.entity.Login;
import com.nurture.backend.service.UserService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")

public class LoginController {

    private final UserService userService;

    public LoginController(UserService userService) {
        this.userService = userService;
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpSession session
    ) {

        Login user = userService.login(request);

        // =====================================================
        // INVALID LOGIN
        // =====================================================

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Email or Password");
        }

        // =====================================================
        // STORE USER ID IN SESSION
        // =====================================================

        session.setAttribute(
                "USER_ID",
                user.getId()
        );

        System.out.println(
                "========================================"
        );

        System.out.println("LOGIN SUCCESS");
        System.out.println("USER ID: " + user.getId());
        System.out.println("NAME: " + user.getFullName());
        System.out.println("EMAIL: " + user.getEmail());
        System.out.println("ROLE: " + user.getRole());

        // =====================================================
        // CHECK MOTHER PROFILE
        // =====================================================

        boolean profileCompleted =
                userService.isProfileCompleted(
                        user.getId()
                );

        // =====================================================
        // CHECK FAMILY MEMBER PROFILE
        // =====================================================

        boolean familyVerified =
                userService.isFamilyVerified(
                        user.getId()
                );

        System.out.println(
                "PROFILE COMPLETED: " + profileCompleted
        );

        System.out.println(
                "FAMILY VERIFIED: " + familyVerified
        );

        System.out.println(
                "========================================"
        );

        // =====================================================
        // CREATE RESPONSE
        // =====================================================

        LoginResponse response =
                new LoginResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole(),
                        "Login Successful",
                        profileCompleted,
                        familyVerified
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // LOGOUT
    // =========================================================

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpSession session
    ) {

        session.invalidate();

        return ResponseEntity.ok(
                "Logout successful"
        );
    }
}