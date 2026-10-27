package com.nurture.backend.controller;

import com.nurture.backend.entity.Medicine;
import com.nurture.backend.entity.MedicineLog;
import com.nurture.backend.service.MedicineService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(
            MedicineService medicineService) {

        this.medicineService = medicineService;
    }

    // =====================================================
    // ADD MEDICINE
    // =====================================================

    @PostMapping("/{userId}")
    public Medicine addMedicine(
            @PathVariable Long userId,
            @RequestBody Medicine medicine) {

        return medicineService.addMedicine(
                userId,
                medicine
        );
    }

    // =====================================================
    // GET ALL MEDICINES
    // =====================================================

    @GetMapping("/{userId}")
    public List<Medicine> getMedicines(
            @PathVariable Long userId) {

        return medicineService.getMedicines(userId);
    }

    // =====================================================
    // GET TODAY'S MEDICINES
    // =====================================================

    @GetMapping("/{userId}/today")
    public List<MedicineLog> getTodayMedicines(
            @PathVariable Long userId) {

        return medicineService.getTodayMedicines(
                userId
        );
    }

    // =====================================================
    // MARK MEDICINE AS TAKEN
    // =====================================================

    @PutMapping("/log/{logId}/taken")
    public MedicineLog markMedicineTaken(
            @PathVariable Long logId) {

        return medicineService.markMedicineTaken(
                logId
        );
    }

    // =====================================================
    // STOP MEDICINE
    // =====================================================

    @PutMapping("/{medicineId}/stop")
    public Medicine stopMedicine(
            @PathVariable Long medicineId) {

        return medicineService.stopMedicine(
                medicineId
        );
    }

    // =====================================================
    // DELETE MEDICINE
    // =====================================================

    @DeleteMapping("/{medicineId}")
    public String deleteMedicine(
            @PathVariable Long medicineId) {

        medicineService.deleteMedicine(
                medicineId
        );

        return "Medicine deleted successfully";
    }
}