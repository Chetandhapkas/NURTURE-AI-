
package com.nurture.backend.settings;

import java.time.LocalDateTime;

public record SettingsResponse(
        Long userId,
        boolean medicineReminders,
        boolean vaccinationReminders,
        boolean appointmentReminders,
        boolean familyUpdates,
        boolean emailNotifications,
        boolean profileVisibility,
        boolean familyDataSharing,
        String language,
        String theme,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static SettingsResponse from(UserSettings settings) {
        return new SettingsResponse(
                settings.getUserId(),
                settings.isMedicineReminders(),
                settings.isVaccinationReminders(),
                settings.isAppointmentReminders(),
                settings.isFamilyUpdates(),
                settings.isEmailNotifications(),
                settings.isProfileVisibility(),
                settings.isFamilyDataSharing(),
                settings.getLanguage(),
                settings.getTheme(),
                settings.getCreatedAt(),
                settings.getUpdatedAt()
        );
    }
}
