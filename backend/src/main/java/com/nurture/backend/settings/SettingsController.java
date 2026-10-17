
package com.nurture.backend.settings;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<SettingsResponse> getSettings(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                settingsService.getSettings(userId)
        );
    }

    @PutMapping("/{userId}")
    public ResponseEntity<SettingsResponse> updateSettings(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateSettingsRequest request) {

        return ResponseEntity.ok(
                settingsService.updateSettings(userId, request)
        );
    }
}
