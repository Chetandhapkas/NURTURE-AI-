
package com.nurture.backend.doctor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public List<Doctor> getDoctors(Long userId) {
        validateUserId(userId);
        return doctorRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    public Doctor getDoctor(Long userId, Long doctorId) {
        validateUserId(userId);
        return findOwnedDoctor(userId, doctorId);
    }

    @Transactional
    public Doctor addDoctor(Long userId, DoctorRequest request) {
        validateUserId(userId);
        validateRequest(request);

        Doctor doctor = new Doctor();
        doctor.setUserId(userId);
        copyRequestToDoctor(request, doctor);

        return doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor updateDoctor(
            Long userId,
            Long doctorId,
            DoctorRequest request
    ) {
        validateUserId(userId);
        validateRequest(request);

        Doctor doctor = findOwnedDoctor(userId, doctorId);
        copyRequestToDoctor(request, doctor);

        return doctorRepository.save(doctor);
    }

    @Transactional
    public void deleteDoctor(Long userId, Long doctorId) {
        validateUserId(userId);

        Doctor doctor = findOwnedDoctor(userId, doctorId);
        doctorRepository.delete(doctor);
    }

    private Doctor findOwnedDoctor(Long userId, Long doctorId) {
        return doctorRepository
                .findByDoctorIdAndUserId(doctorId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Doctor not found for this user"
                ));
    }

    private void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A valid user ID is required"
            );
        }
    }

    private void validateRequest(DoctorRequest request) {
        if (request == null
                || request.getDoctorName() == null
                || request.getDoctorName().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor name is required"
            );
        }

        if (request.getDoctorName().trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor name must be 100 characters or fewer"
            );
        }

        if (request.getSpecialization() != null
                && request.getSpecialization().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Specialization must be 100 characters or fewer"
            );
        }

        if (request.getHospitalName() != null
                && request.getHospitalName().length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Hospital name must be 150 characters or fewer"
            );
        }

        if (request.getPhoneNumber() != null
                && request.getPhoneNumber().length() > 15) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phone number must be 15 characters or fewer"
            );
        }

        if (request.getEmail() != null
                && request.getEmail().length() > 255) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email must be 255 characters or fewer"
            );
        }
    }

    private void copyRequestToDoctor(
            DoctorRequest request,
            Doctor doctor
    ) {
        doctor.setDoctorName(request.getDoctorName().trim());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setHospitalName(request.getHospitalName());
        doctor.setPhoneNumber(request.getPhoneNumber());
        doctor.setEmail(request.getEmail());
        doctor.setConsultationDate(request.getConsultationDate());
        doctor.setRemarks(request.getRemarks());
    }
}
