package com.nurture.backend.controller;

import com.nurture.backend.entity.Login;
import com.nurture.backend.repository.LoginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")

public class UserController {

    @Autowired
    private LoginRepository loginRepository;

    // =========================================================
    // GET REGISTERED USER INFORMATION
    // =========================================================

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long userId) {

        Login user = loginRepository.findById(userId)
                .orElse(null);

        if (user == null) {

            Map<String, Object> error = new HashMap<>();

            error.put("message", "User not found");
            error.put("userId", userId);

            return ResponseEntity
                    .status(404)
                    .body(error);
        }

        // =====================================================
        // RETURN REGISTERED ACCOUNT INFORMATION
        // PASSWORD IS NOT RETURNED
        // =====================================================

        Map<String, Object> response = new HashMap<>();

        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}