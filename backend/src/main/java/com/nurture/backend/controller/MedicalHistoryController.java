package com.nurture.backend.controller;

import com.nurture.backend.dto.MedicalHistoryRequest;
import com.nurture.backend.dto.MedicalHistoryResponse;
import com.nurture.backend.service.MedicalHistoryService;
import com.nurture.backend.repository.MedicalHistoryRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medical-history")
public class MedicalHistoryController {

    private final MedicalHistoryService medicalHistoryService;
    private final MedicalHistoryRepository medicalHistoryRepository;

    public MedicalHistoryController(
            MedicalHistoryService medicalHistoryService,
            MedicalHistoryRepository medicalHistoryRepository
    ) {
        this.medicalHistoryService = medicalHistoryService;
        this.medicalHistoryRepository = medicalHistoryRepository;
    }


    // =========================================================
    // CHECK IF MEDICAL HISTORY EXISTS
    // GET /api/medical-history/exists/{userId}
    // =========================================================

    @GetMapping("/exists/{userId}")
    public ResponseEntity<Boolean> exists(
            @PathVariable Long userId
    ) {

        boolean exists =
                medicalHistoryRepository.existsByUser_Id(userId);

        return ResponseEntity.ok(exists);
    }


    // =========================================================
    // SAVE
    // POST /api/medical-history/{userId}
    // =========================================================

    @PostMapping("/{userId}")
    public ResponseEntity<MedicalHistoryResponse> saveMedicalHistory(
            @PathVariable Long userId,
            @RequestBody MedicalHistoryRequest request
    ) {

        MedicalHistoryResponse response =
                medicalHistoryService.saveMedicalHistory(
                        userId,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET
    // GET /api/medical-history/{userId}
    // =========================================================

    @GetMapping("/{userId}")
    public ResponseEntity<MedicalHistoryResponse> getMedicalHistory(
            @PathVariable Long userId
    ) {

        MedicalHistoryResponse response =
                medicalHistoryService.getMedicalHistory(userId);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // UPDATE
    // PUT /api/medical-history/{userId}
    // =========================================================

    @PutMapping("/{userId}")
    public ResponseEntity<MedicalHistoryResponse> updateMedicalHistory(
            @PathVariable Long userId,
            @RequestBody MedicalHistoryRequest request
    ) {

        MedicalHistoryResponse response =
                medicalHistoryService.updateMedicalHistory(
                        userId,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // DELETE
    // DELETE /api/medical-history/{userId}
    // =========================================================

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteMedicalHistory(
            @PathVariable Long userId
    ) {

        medicalHistoryService.deleteMedicalHistory(userId);

        return ResponseEntity.ok(
                "Medical history deleted successfully"
        );
    }
}