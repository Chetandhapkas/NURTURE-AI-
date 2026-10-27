package com.nurture.backend.controller;

import com.nurture.backend.dto.HealthTrackingRequest;
import com.nurture.backend.dto.HealthTrackingResponse;
import com.nurture.backend.service.DailyHealthTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-tracking")
@RequiredArgsConstructor

public class HealthTrackingController {

    private final DailyHealthTrackingService healthService;


    // ============================================================
    // SAVE / UPDATE DAILY HEALTH DATA
    // ============================================================

    @PostMapping("/{userId}")
    public ResponseEntity<HealthTrackingResponse> saveHealthData(
            @PathVariable Long userId,
            @RequestBody HealthTrackingRequest request
    ) {

        HealthTrackingResponse response =
                healthService.saveHealthData(
                        userId,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // GET TODAY
    // ============================================================

    @GetMapping("/{userId}/today")
    public ResponseEntity<HealthTrackingResponse> getToday(
            @PathVariable Long userId
    ) {

        HealthTrackingResponse response =
                healthService.getToday(userId);

        if (response == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // GET LAST 7 DAYS
    // ============================================================

    @GetMapping("/{userId}/last-7-days")
    public ResponseEntity<List<HealthTrackingResponse>> getLast7Days(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                healthService.getLast7Days(userId)
        );
    }


    // ============================================================
    // GET HISTORY
    // ============================================================

    @GetMapping("/{userId}/history")
    public ResponseEntity<List<HealthTrackingResponse>> getHistory(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                healthService.getHistory(userId)
        );
    }
}