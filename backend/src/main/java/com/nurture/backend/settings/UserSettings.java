
package com.nurture.backend.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_settings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_settings_user_id",
                        columnNames = "user_id"
                )
        }
)
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private boolean medicineReminders = true;

    @Column(nullable = false)
    private boolean vaccinationReminders = true;

    @Column(nullable = false)
    private boolean appointmentReminders = true;

    @Column(nullable = false)
    private boolean familyUpdates = true;

    @Column(nullable = false)
    private boolean emailNotifications = false;

    @Column(nullable = false)
    private boolean profileVisibility = true;

    @Column(nullable = false)
    private boolean familyDataSharing = true;

    @Column(nullable = false, length = 40)
    private String language = "English";

    @Column(nullable = false, length = 40)
    private String theme = "Lavender & Pink";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void beforeInsert() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void beforeUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isMedicineReminders() {
        return medicineReminders;
    }

    public void setMedicineReminders(boolean value) {
        medicineReminders = value;
    }

    public boolean isVaccinationReminders() {
        return vaccinationReminders;
    }

    public void setVaccinationReminders(boolean value) {
        vaccinationReminders = value;
    }

    public boolean isAppointmentReminders() {
        return appointmentReminders;
    }

    public void setAppointmentReminders(boolean value) {
        appointmentReminders = value;
    }

    public boolean isFamilyUpdates() {
        return familyUpdates;
    }

    public void setFamilyUpdates(boolean value) {
        familyUpdates = value;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(boolean value) {
        emailNotifications = value;
    }

    public boolean isProfileVisibility() {
        return profileVisibility;
    }

    public void setProfileVisibility(boolean value) {
        profileVisibility = value;
    }

    public boolean isFamilyDataSharing() {
        return familyDataSharing;
    }

    public void setFamilyDataSharing(boolean value) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
