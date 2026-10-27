package com.nurture.backend.controller;

import com.nurture.backend.dto.PregnancyProfileRequest;
import com.nurture.backend.entity.PregnancyProfile;
import com.nurture.backend.service.PregnancyProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pregnancy")
public class PregnancyProfileController {

    @Autowired
    private PregnancyProfileService service;

    /*
     * =========================================================
     * SAVE PREGNANCY PROFILE
     * POST /api/pregnancy
     * =========================================================
     */
    @PostMapping
    public PregnancyProfile save(
            @RequestBody PregnancyProfileRequest request) {

        return service.save(request);
    }

    /*
     * =========================================================
     * GET PREGNANCY PROFILE
     * GET /api/pregnancy/user/{userId}
     * =========================================================
     */
    @GetMapping("/user/{userId}")
    public PregnancyProfile getProfile(
            @PathVariable Long userId) {

        return service.getProfile(userId);
    }

    /*
     * =========================================================
     * CHECK IF PROFILE EXISTS
     * GET /api/pregnancy/exists/{userId}
     * =========================================================
     */
    @GetMapping("/exists/{userId}")
    public boolean exists(
            @PathVariable Long userId) {

        return service.exists(userId);
    }

    /*
     * =========================================================
     * UPDATE PREGNANCY PROFILE
     * PUT /api/pregnancy/user/{userId}
     * =========================================================
     */
    @PutMapping("/user/{userId}")
    public PregnancyProfile update(
            @PathVariable Long userId,
            @RequestBody PregnancyProfileRequest request) {

        /*
         * Make sure the request uses the correct user.
         */
        request.setUserId(userId);

        return service.save(request);
    }
}