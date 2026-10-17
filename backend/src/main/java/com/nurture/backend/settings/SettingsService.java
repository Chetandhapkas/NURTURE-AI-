
package com.nurture.backend.settings;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final UserSettingsRepository repository;

    public SettingsService(UserSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SettingsResponse getSettings(Long userId) {
        validateUserId(userId);

        UserSettings settings = repository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

        return SettingsResponse.from(settings);
    }

    @Transactional
    public SettingsResponse updateSettings(
            Long userId,
            UpdateSettingsRequest request) {

        validateUserId(userId);

        UserSettings settings = repository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

        if (request.getMedicineReminders() != null) {
            settings.setMedicineReminders(
                    request.getMedicineReminders()
            );
        }

        if (request.getVaccinationReminders() != null) {
            settings.setVaccinationReminders(
                    request.getVaccinationReminders()
            );
        }

        if (request.getAppointmentReminders() != null) {
            settings.setAppointmentReminders(
                    request.getAppointmentReminders()
            );
        }

        if (request.getFamilyUpdates() != null) {
            settings.setFamilyUpdates(request.getFamilyUpdates());
        }

        if (request.getEmailNotifications() != null) {
            settings.setEmailNotifications(
                    request.getEmailNotifications()
            );
        }

        if (request.getProfileVisibility() != null) {
            settings.setProfileVisibility(
                    request.getProfileVisibility()
            );
        }

        if (request.getFamilyDataSharing() != null) {
            settings.setFamilyDataSharing(
                    request.getFamilyDataSharing()
            );
        }

        if (request.getLanguage() != null) {
            settings.setLanguage(request.getLanguage());
        }

        if (request.getTheme() != null) {
            settings.setTheme(request.getTheme());
        }

        UserSettings saved = repository.save(settings);

        return SettingsResponse.from(saved);
    }

    private UserSettings createDefaultSettings(Long userId) {
        UserSettings settings = new UserSettings();
        settings.setUserId(userId);

        return repository.save(settings);
    }

    private void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException(
                    "A valid user ID is required."
            );
        }
    }
}
