package com.nurture.backend.controller;

import com.nurture.backend.dto.UserProfileRequest;
import com.nurture.backend.entity.UserProfile;
import com.nurture.backend.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")

public class UserProfileController {

    @Autowired
    private UserProfileService service;

    // =========================================================
    // CREATE PERSONAL INFORMATION
    // =========================================================

    @PostMapping("/personal-info")
    public ResponseEntity<UserProfile> savePersonalInfo(
            @RequestBody UserProfileRequest request) {

        UserProfile profile = service.save(request);

        return ResponseEntity.ok(profile);
    }

    // =========================================================
    // GET PERSONAL INFORMATION
    // =========================================================

    @GetMapping("/personal-info/{userId}")
    public ResponseEntity<UserProfile> getPersonalInfo(
            @PathVariable Long userId) {

        UserProfile profile = service.getByUserId(userId);

        return ResponseEntity.ok(profile);
    }

    // =========================================================
    // UPDATE PERSONAL INFORMATION
    // =========================================================

    @PutMapping("/personal-info/{userId}")
    public ResponseEntity<UserProfile> updatePersonalInfo(
            @PathVariable Long userId,
            @RequestBody UserProfileRequest request) {

        UserProfile profile =
                service.update(userId, request);

        return ResponseEntity.ok(profile);
    }
}