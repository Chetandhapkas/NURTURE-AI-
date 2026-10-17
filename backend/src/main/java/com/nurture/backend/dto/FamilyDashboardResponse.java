
package com.nurture.backend.dto;

import java.util.List;

public class FamilyDashboardResponse {

    private Long patientUserId;

    // =========================================================
    // MOTHER
    // =========================================================

    private String name;
    private String email;
    private String phone;
    private Integer age;

    // =========================================================
    // PREGNANCY
    // =========================================================

    private Integer pregnancyWeek;
    private String trimester;
    private String dueDate;
    private String pregnancyType;
    private Integer babyCount;
    private Boolean highRisk;

    // =========================================================
    // APPOINTMENTS
    // =========================================================

    private List<FamilyAppointmentResponse> appointments;

    // =========================================================
    // HEALTH
    // =========================================================

    private Integer healthScore;

    // =========================================================
    // MEDICINES
    // =========================================================

    private List<FamilyMedicineResponse> medicines;

    // =========================================================
    // TODAY'S MEDICINE SCHEDULE
    // =========================================================

    private List<FamilyMedicineLogResponse> todayMedicineSchedule;

    // =========================================================
    // VACCINATIONS
    // =========================================================

    private List<FamilyVaccinationResponse> vaccinations;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public FamilyDashboardResponse() {
    }

    // =========================================================
    // MOTHER GETTERS / SETTERS
    // =========================================================

    public Long getPatientUserId() {
        return patientUserId;
    }

    public void setPatientUserId(Long patientUserId) {
        this.patientUserId = patientUserId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    // =========================================================
    // PREGNANCY GETTERS / SETTERS
    // =========================================================

    public Integer getPregnancyWeek() {
        return pregnancyWeek;
    }

    public void setPregnancyWeek(Integer pregnancyWeek) {
        this.pregnancyWeek = pregnancyWeek;
    }

    public String getTrimester() {
        return trimester;
    }

    public void setTrimester(String trimester) {
        this.trimester = trimester;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public String getPregnancyType() {
        return pregnancyType;
    }

    public void setPregnancyType(String pregnancyType) {
        this.pregnancyType = pregnancyType;
    }

    public Integer getBabyCount() {
        return babyCount;
    }

    public void setBabyCount(Integer babyCount) {
        this.babyCount = babyCount;
    }

    public Boolean getHighRisk() {
        return highRisk;
    }

    public void setHighRisk(Boolean highRisk) {
        this.highRisk = highRisk;
    }

    // =========================================================
    // APPOINTMENT GETTERS / SETTERS
    // =========================================================

    public List<FamilyAppointmentResponse> getAppointments() {
        return appointments;
    }

    public void setAppointments(
            List<FamilyAppointmentResponse> appointments
    ) {
        this.appointments = appointments;
    }

    // =========================================================
    // HEALTH SCORE GETTERS / SETTERS
    // =========================================================

    public Integer getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(Integer healthScore) {
        this.healthScore = healthScore;
    }

    // =========================================================
    // MEDICINE GETTERS / SETTERS
    // =========================================================

    public List<FamilyMedicineResponse> getMedicines() {
        return medicines;
    }

    public void setMedicines(
            List<FamilyMedicineResponse> medicines
    ) {
        this.medicines = medicines;
    }

    // =========================================================
    // TODAY'S MEDICINE SCHEDULE GETTERS / SETTERS
    // =========================================================

    public List<FamilyMedicineLogResponse> getTodayMedicineSchedule() {
        return todayMedicineSchedule;
    }

    public void setTodayMedicineSchedule(
            List<FamilyMedicineLogResponse> todayMedicineSchedule
    ) {
        this.todayMedicineSchedule = todayMedicineSchedule;
    }

    // =========================================================
    // VACCINATION GETTERS / SETTERS
    // =========================================================

    public List<FamilyVaccinationResponse> getVaccinations() {
        return vaccinations;
    }

    public void setVaccinations(
            List<FamilyVaccinationResponse> vaccinations
    ) {
        this.vaccinations = vaccinations;
    }
}
