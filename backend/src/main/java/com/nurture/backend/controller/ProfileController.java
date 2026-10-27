package com.nurture.backend.controller;

import com.nurture.backend.dto.ProfileResponse;
import com.nurture.backend.service.ProfileService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")

public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(
            ProfileService profileService
    ) {
        this.profileService =
                profileService;
    }


    // =========================================================
    // GET MY COMPLETE PROFILE
    // GET /api/profile/me
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(
            HttpSession session
    ) {

        Object userIdObject =
                session.getAttribute("USER_ID");


        System.out.println(
                "Profile request - USER_ID from session: "
                        + userIdObject
        );


        if (userIdObject == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "User session not found. Please login again."
                    );
        }


        Long userId;

        try {

            userId =
                    Long.valueOf(
                            userIdObject.toString()
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Invalid user session."
                    );
        }


        try {

            ProfileResponse profile =
                    profileService
                            .getProfileById(userId);


            System.out.println(
                    "Profile loaded successfully for USER_ID: "
                            + userId
            );


            return ResponseEntity.ok(profile);

        } catch (RuntimeException e) {

            System.out.println(
                    "Profile error: "
                            + e.getMessage()
            );


            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            e.getMessage()
                    );
        }
    }


    // =========================================================
    // CHECK IF PERSONAL INFO IS COMPLETED
    // GET /api/profile/exists/{userId}
    // =========================================================

    @GetMapping("/exists/{userId}")
    public ResponseEntity<Boolean> profileExists(
            @PathVariable Long userId
    ) {

        boolean exists =
                profileService.exists(userId);

        return ResponseEntity.ok(exists);
    }
}