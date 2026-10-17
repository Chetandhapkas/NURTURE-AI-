package com.nurture.backend.dto;

public class FamilyMedicineResponse {

    private Long id;
    private String medicineName;
    private String dosage;
    private String frequency;
    private String startDate;
    private String endDate;
    private String reminderTime;
    private String reminderTime2;
    private String reminderTime3;
    private String instructions;
    private String status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getReminderTime() {
        return reminderTime;
    }

    public void setReminderTime(String reminderTime) {
        this.reminderTime = reminderTime;
    }

    public String getReminderTime2() {
        return reminderTime2;
    }

    public void setReminderTime2(String reminderTime2) {
        this.reminderTime2 = reminderTime2;
    }

    public String getReminderTime3() {
        return reminderTime3;
    }

    public void setReminderTime3(String reminderTime3) {
        this.reminderTime3 = reminderTime3;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}