
package com.nurture.backend.doctor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // Get all personal doctors for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Doctor>> getDoctors(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                doctorService.getDoctors(userId)
        );
    }

    // Get one personal doctor
    @GetMapping("/user/{userId}/{doctorId}")
    public ResponseEntity<Doctor> getDoctor(
            @PathVariable Long userId,
            @PathVariable Long doctorId
    ) {
        return ResponseEntity.ok(
                doctorService.getDoctor(userId, doctorId)
        );
    }

    // Add a personal doctor
    @PostMapping("/user/{userId}")
    public ResponseEntity<Doctor> addDoctor(
            @PathVariable Long userId,
            @RequestBody DoctorRequest request
    ) {
        Doctor savedDoctor = doctorService.addDoctor(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedDoctor);
    }

    // Update a personal doctor
    @PutMapping("/user/{userId}/{doctorId}")
    public ResponseEntity<Doctor> updateDoctor(
            @PathVariable Long userId,
            @PathVariable Long doctorId,
            @RequestBody DoctorRequest request
    ) {
        return ResponseEntity.ok(
                doctorService.updateDoctor(userId, doctorId, request)
        );
    }

    // Delete a personal doctor
    @DeleteMapping("/user/{userId}/{doctorId}")
    public ResponseEntity<Void> deleteDoctor(
            @PathVariable Long userId,
            @PathVariable Long doctorId
    ) {
        doctorService.deleteDoctor(userId, doctorId);
        return ResponseEntity.noContent().build();
    }
}
