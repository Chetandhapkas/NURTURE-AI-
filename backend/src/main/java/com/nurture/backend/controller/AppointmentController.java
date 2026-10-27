package com.nurture.backend.controller;

import com.nurture.backend.entity.Appointment;
import com.nurture.backend.service.AppointmentService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")

public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(
            AppointmentService service
    ) {
        this.service = service;
    }

    // =========================================================
    // CREATE APPOINTMENT
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createAppointment(
            @RequestBody Appointment appointment,
            HttpSession session
    ) {

        Long userId =
                (Long) session.getAttribute("USER_ID");

        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not logged in");
        }

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (appointment.getDoctorName() == null ||
                appointment.getDoctorName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Doctor name is required");
        }

        if (appointment.getAppointmentDate() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Appointment date is required");
        }

        if (appointment.getAppointmentTime() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Appointment time is required");
        }

        if (appointment.getHospital() == null ||
                appointment.getHospital().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Hospital is required");
        }

        // -----------------------------------------------------
        // SET USER FROM SESSION
        // -----------------------------------------------------
        //
        // NEVER trust userId coming from frontend.
        //

        appointment.setUserId(userId);

        // -----------------------------------------------------
        // IGNORE STATUS FROM FRONTEND
        // -----------------------------------------------------
        //
        // AppointmentService will calculate:
        //
        // Past date/time   -> COMPLETED
        // Future date/time -> UPCOMING
        //

        appointment.setStatus(null);

        // -----------------------------------------------------
        // CREATE APPOINTMENT
        // -----------------------------------------------------

        try {

            Appointment saved =
                    service.createAppointment(
                            appointment
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(saved);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET CURRENT USER APPOINTMENTS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<?> getMyAppointments(
            HttpSession session
    ) {

        Long userId =
                (Long) session.getAttribute("USER_ID");

        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not logged in");
        }

        try {

            /*
             * AppointmentService will also update old
             * UPCOMING appointments to COMPLETED when
             * their date/time has passed.
             */

            List<Appointment> appointments =
                    service.getAppointmentsByUserId(
                            userId
                    );

            return ResponseEntity.ok(
                    appointments
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET SINGLE APPOINTMENT
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointment(
            @PathVariable Long id,
            HttpSession session
    ) {

        Long userId =
                (Long) session.getAttribute("USER_ID");

        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not logged in");
        }

        Appointment appointment;

        try {

            appointment =
                    service.getAppointmentById(id);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found");
        }

        // -----------------------------------------------------
        // SECURITY CHECK
        // -----------------------------------------------------

        if (!userId.equals(
                appointment.getUserId()
        )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You cannot access this appointment"
                    );
        }

        return ResponseEntity.ok(
                appointment
        );
    }

    // =========================================================
    // UPDATE / RESCHEDULE APPOINTMENT
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable Long id,
            @RequestBody Appointment appointment,
            HttpSession session
    ) {

        Long userId =
                (Long) session.getAttribute("USER_ID");

        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not logged in");
        }

        Appointment existing;

        try {

            existing =
                    service.getAppointmentById(id);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found");
        }

        // -----------------------------------------------------
        // SECURITY CHECK
        // -----------------------------------------------------

        if (!userId.equals(
                existing.getUserId()
        )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You cannot update this appointment"
                    );
        }

        // -----------------------------------------------------
        // NEVER ALLOW OWNERSHIP CHANGE
        // -----------------------------------------------------

        appointment.setUserId(userId);

        // -----------------------------------------------------
        // UPDATE
        // -----------------------------------------------------

        try {

            Appointment updated =
                    service.updateAppointment(
                            id,
                            appointment
                    );

            return ResponseEntity.ok(
                    updated
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // CANCEL APPOINTMENT
    // =========================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long id,
            HttpSession session
    ) {

        Long userId =
                (Long) session.getAttribute("USER_ID");

        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not logged in");
        }

        Appointment appointment;

        // -----------------------------------------------------
        // FIND APPOINTMENT
        // -----------------------------------------------------

        try {

            appointment =
                    service.getAppointmentById(id);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found");
        }

        // -----------------------------------------------------
        // SECURITY CHECK
        // -----------------------------------------------------

        if (!userId.equals(
                appointment.getUserId()
        )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You cannot cancel this appointment"
                    );
        }

        // -----------------------------------------------------
        // CHECK ALREADY CANCELLED
        // -----------------------------------------------------

        if ("CANCELLED".equalsIgnoreCase(
                appointment.getStatus()
        )) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Appointment is already cancelled"
                    );
        }

        // -----------------------------------------------------
        // CHECK COMPLETED
        // -----------------------------------------------------

        if ("COMPLETED".equalsIgnoreCase(
                appointment.getStatus()
        )) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Completed appointments cannot be cancelled"
                    );
        }

        // -----------------------------------------------------
        // CANCEL
        // -----------------------------------------------------

        try {

            Appointment cancelled =
                    service.cancelAppointment(id);

            return ResponseEntity.ok(
                    cancelled
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // DELETE APPOINTMENT
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(
            @PathVariable Long id,
            HttpSession session
    ) {

        Long userId =
                (Long) session.getAttribute("USER_ID");

        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not logged in");
        }

        Appointment appointment;

        // -----------------------------------------------------
        // FIND APPOINTMENT
        // -----------------------------------------------------

        try {

            appointment =
                    service.getAppointmentById(id);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found");
        }

        // -----------------------------------------------------
        // SECURITY CHECK
        // -----------------------------------------------------

        if (!userId.equals(
                appointment.getUserId()
        )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You cannot delete this appointment"
                    );
        }

        // -----------------------------------------------------
        // DELETE
        // -----------------------------------------------------

        try {

            service.deleteAppointment(id);

            return ResponseEntity.ok(
                    "Appointment deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}