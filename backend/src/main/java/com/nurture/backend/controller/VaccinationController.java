package com.nurture.backend.controller;

import com.nurture.backend.entity.Vaccination;
import com.nurture.backend.service.VaccinationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vaccinations")
public class VaccinationController {

    private final VaccinationService vaccinationService;

    public VaccinationController(VaccinationService vaccinationService) {
        this.vaccinationService = vaccinationService;
    }


    // Get all vaccinations of a user
    @GetMapping("/{userId}")
    public List<Vaccination> getVaccinations(
            @PathVariable Long userId) {

        return vaccinationService.getVaccinations(userId);
    }


    // Mark vaccination as taken
    @PutMapping("/{vaccinationId}/taken")
    public Vaccination markTaken(
            @PathVariable Long vaccinationId) {

        return vaccinationService.markTaken(vaccinationId);
    }


    // Add custom vaccination
    @PostMapping("/{userId}/add")
    public Vaccination addVaccination(
            @PathVariable Long userId,
            @RequestBody Vaccination vaccination) {

        return vaccinationService.addCustomVaccination(
                userId,
                vaccination
        );
    }
}