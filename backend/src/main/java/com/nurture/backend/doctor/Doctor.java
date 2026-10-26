
package com.nurture.backend.doctor;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors", schema = "public")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doctor_id")
    private Long doctorId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "doctor_name", nullable = false, length = 100)
    private String doctorName;

    @Column(name = "specialization", length = 100)
    private String specialization;

    @Column(name = "hospital_name", length = 150)
    private String hospitalName;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "consultation_date")
    private LocalDate consultationDate;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Doctor() {
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
