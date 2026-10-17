
package com.nurture.backend.settings;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateSettingsRequest {

    private Boolean medicineReminders;
    private Boolean vaccinationReminders;
    private Boolean appointmentReminders;
    private Boolean familyUpdates;
    private Boolean emailNotifications;
    private Boolean profileVisibility;
    private Boolean familyDataSharing;

    @Size(max = 40)
    @Pattern(
            regexp = "English|Hindi|Marathi",
            message = "Language must be English, Hindi, or Marathi"
    )
    private String language;

    @Size(max = 40)
    @Pattern(
            regexp = "Lavender & Pink|Light|Dark",
            message = "Invalid theme"
    )
    private String theme;

    public Boolean getMedicineReminders() {
        return medicineReminders;
    }

    public void setMedicineReminders(Boolean value) {
        medicineReminders = value;
    }

    public Boolean getVaccinationReminders() {
        return vaccinationReminders;
    }

    public void setVaccinationReminders(Boolean value) {
        vaccinationReminders = value;
    }

    public Boolean getAppointmentReminders() {
        return appointmentReminders;
    }

    public void setAppointmentReminders(Boolean value) {
        appointmentReminders = value;
    }

    public Boolean getFamilyUpdates() {
        return familyUpdates;
    }

    public void setFamilyUpdates(Boolean value) {
        familyUpdates = value;
    }

    public Boolean getEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(Boolean value) {
        emailNotifications = value;
    }

    public Boolean getProfileVisibility() {
        return profileVisibility;
    }

    public void setProfileVisibility(Boolean value) {
        profileVisibility = value;
    }

    public Boolean getFamilyDataSharing() {
        return familyDataSharing;
    }

    public void setFamilyDataSharing(Boolean value) {
        familyDataSharing = value;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }
}
