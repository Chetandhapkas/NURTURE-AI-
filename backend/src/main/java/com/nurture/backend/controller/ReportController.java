package com.nurture.backend.controller;

import com.nurture.backend.dto.ReportResponse;
import com.nurture.backend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")

public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ReportResponse> getReport(
            @PathVariable Long userId
    ) {
        ReportResponse report = reportService.getReport(userId);

        return ResponseEntity.ok(report);
    }
}