package com.nurture.backend.controller;

import com.nurture.backend.dto.FamilyDashboardResponse;
import com.nurture.backend.service.FamilyDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/family-members")
@CrossOrigin(origins = "*")
public class FamilyDashboardController {

    private final FamilyDashboardService familyDashboardService;

    public FamilyDashboardController(
            FamilyDashboardService familyDashboardService
    ) {
        this.familyDashboardService =
                familyDashboardService;
    }

    @GetMapping("/dashboard/{familyMemberUserId}")
    public ResponseEntity<FamilyDashboardResponse>
    getFamilyDashboard(
            @PathVariable Long familyMemberUserId
    ) {

        FamilyDashboardResponse response =
                familyDashboardService
                        .getDashboard(
                                familyMemberUserId
                        );

        return ResponseEntity.ok(response);
    }
}