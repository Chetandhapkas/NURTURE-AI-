package com.nurture.backend.family;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/family")
public class MotherFamilyController {

    private final MotherFamilyJdbcRepository motherFamilyJdbcRepository;

    public MotherFamilyController(
            MotherFamilyJdbcRepository motherFamilyJdbcRepository) {
        this.motherFamilyJdbcRepository = motherFamilyJdbcRepository;
    }

    @GetMapping("/members")
    public ResponseEntity<?> getFamilyMembers(
            @RequestParam Long patientUserId) {

        if (patientUserId == null || patientUserId <= 0) {
            return ResponseEntity.badRequest()
                    .body("A valid patientUserId is required.");
        }

        try {
            List<MotherFamilyMemberResponse> members =
                    motherFamilyJdbcRepository
                            .findByPatientUserId(patientUserId);

            return ResponseEntity.ok(members);

        } catch (Exception exception) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to load family members.");
        }
    }
}