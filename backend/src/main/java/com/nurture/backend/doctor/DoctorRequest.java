
package com.nurture.backend.doctor;

import java.time.LocalDate;

public class DoctorRequest {

    private String doctorName;
    private String specialization;
    private String hospitalName;
    private String phoneNumber;
    private String email;
    private LocalDate consultationDate;
    private String remarks;

    public DoctorRequest() {
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getConsultationDate() {
        return consultationDate;
    }

    public void setConsultationDate(LocalDate consultationDate) {
        this.consultationDate = consultationDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
