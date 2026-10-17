
package com.nurture.backend.service;

import com.nurture.backend.dto.FamilyAppointmentResponse;
import com.nurture.backend.dto.FamilyDashboardResponse;
import com.nurture.backend.dto.FamilyMedicineResponse;
import com.nurture.backend.dto.FamilyMedicineLogResponse;
import com.nurture.backend.dto.FamilyVaccinationResponse;

import com.nurture.backend.entity.Appointment;
import com.nurture.backend.entity.FamilyMember;
import com.nurture.backend.entity.Login;
import com.nurture.backend.entity.PregnancyProfile;
import com.nurture.backend.entity.UserProfile;
import com.nurture.backend.entity.Medicine;
import com.nurture.backend.entity.MedicineLog;
import com.nurture.backend.entity.Vaccination;

import com.nurture.backend.repository.AppointmentRepository;
import com.nurture.backend.repository.FamilyMemberRepository;
import com.nurture.backend.repository.LoginRepository;
import com.nurture.backend.repository.PregnancyProfileRepository;
import com.nurture.backend.repository.UserProfileRepository;
import com.nurture.backend.repository.MedicineRepository;
import com.nurture.backend.repository.MedicineLogRepository;
import com.nurture.backend.repository.VaccinationRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FamilyDashboardService {

    private final LoginRepository loginRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final UserProfileRepository userProfileRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineLogRepository medicineLogRepository;
    private final VaccinationRepository vaccinationRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public FamilyDashboardService(
            LoginRepository loginRepository,
            FamilyMemberRepository familyMemberRepository,
            UserProfileRepository userProfileRepository,
            PregnancyProfileRepository pregnancyProfileRepository,
            AppointmentRepository appointmentRepository,
            MedicineRepository medicineRepository,
            MedicineLogRepository medicineLogRepository,
            VaccinationRepository vaccinationRepository
    ) {
        this.loginRepository = loginRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.userProfileRepository = userProfileRepository;
        this.pregnancyProfileRepository = pregnancyProfileRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicineRepository = medicineRepository;
        this.medicineLogRepository = medicineLogRepository;
        this.vaccinationRepository = vaccinationRepository;
    }

    // =========================================================
    // FAMILY DASHBOARD
    // =========================================================

    public FamilyDashboardResponse getDashboard(
            Long familyMemberUserId
    ) {

        // 1. VALIDATE FAMILY MEMBER ID

        if (familyMemberUserId == null) {
            throw new RuntimeException(
                    "Family member user ID is required"
            );
        }

        // 2. FIND FAMILY MEMBER

        Optional<FamilyMember> familyMemberOptional =
                familyMemberRepository.findByUserId(
                        familyMemberUserId
                );

        if (familyMemberOptional.isEmpty()) {
            throw new RuntimeException(
                    "Family member profile not found for userId: "
                            + familyMemberUserId
            );
        }

        FamilyMember familyMember =
                familyMemberOptional.get();

        // 3. GET LINKED MOTHER USER ID

        Long patientUserId =
                familyMember.getPatientUserId();

        if (patientUserId == null) {
            throw new RuntimeException(
                    "Mother is not linked with this family member."
            );
        }

        // 4. FIND MOTHER

        Optional<Login> motherOptional =
                loginRepository.findById(patientUserId);

        if (motherOptional.isEmpty()) {
            throw new RuntimeException(
                    "Mother user not found with userId: "
                            + patientUserId
            );
        }

        Login mother = motherOptional.get();

        // 5. CREATE RESPONSE

        FamilyDashboardResponse response =
                new FamilyDashboardResponse();

        response.setPatientUserId(patientUserId);

        // =====================================================
        // 6. MOTHER BASIC INFORMATION
        // =====================================================

        response.setName(mother.getFullName());
        response.setEmail(mother.getEmail());
        response.setPhone(mother.getPhoneNumber());

        // =====================================================
        // 7. USER PROFILE
        // =====================================================

        Optional<UserProfile> profileOptional =
                userProfileRepository.findByUser(mother);

        if (profileOptional.isPresent()) {
            UserProfile profile = profileOptional.get();
            response.setAge(profile.getAge());
        }

        // =====================================================
        // 8. PREGNANCY PROFILE
        // =====================================================

        Optional<PregnancyProfile> pregnancyOptional =
                pregnancyProfileRepository.findByUser_Id(
                        patientUserId
                );

        if (pregnancyOptional.isPresent()) {

            PregnancyProfile pregnancy =
                    pregnancyOptional.get();

            response.setPregnancyWeek(
                    pregnancy.getPregnancyWeek()
            );

            response.setTrimester(
                    pregnancy.getTrimester()
            );

            response.setDueDate(
                    pregnancy.getDueDate()
            );

            response.setPregnancyType(
                    pregnancy.getPregnancyType()
            );

            response.setBabyCount(
                    pregnancy.getBabyCount()
            );

            response.setHighRisk(
                    pregnancy.getHighRisk()
            );
        }

        // =====================================================
        // 9. APPOINTMENTS
        // =====================================================

        List<Appointment> appointments =
                appointmentRepository
                        .findByUserIdOrderByAppointmentDateAscAppointmentTimeAsc(
                                patientUserId
                        );

        List<FamilyAppointmentResponse> appointmentResponses =
                new ArrayList<>();

        for (Appointment appointment : appointments) {

            FamilyAppointmentResponse item =
                    new FamilyAppointmentResponse();

            item.setId(appointment.getId());
            item.setDoctorName(appointment.getDoctorName());
            item.setSpecialization(
                    appointment.getSpecialization()
            );

            item.setAppointmentDate(
                    appointment.getAppointmentDate() == null
                            ? null
                            : appointment.getAppointmentDate().toString()
            );

            item.setAppointmentTime(
                    appointment.getAppointmentTime() == null
                            ? null
                            : appointment.getAppointmentTime().toString()
            );

            item.setHospital(appointment.getHospital());
            item.setStatus(appointment.getStatus());

            appointmentResponses.add(item);
        }

        response.setAppointments(appointmentResponses);

        // =====================================================
        // 10. HEALTH SCORE
        // =====================================================

        // Keep null until the health-score calculation is connected.
        response.setHealthScore(null);

        // =====================================================
        // 11. MOTHER'S MEDICINES
        // =====================================================

        List<Medicine> medicines =
                medicineRepository.findByUser_Id(patientUserId);

        List<FamilyMedicineResponse> medicineResponses =
                new ArrayList<>();

        for (Medicine medicine : medicines) {

            FamilyMedicineResponse item =
                    new FamilyMedicineResponse();

            item.setId(medicine.getId());
            item.setMedicineName(medicine.getMedicineName());
            item.setDosage(medicine.getDosage());
            item.setFrequency(medicine.getFrequency());

            item.setStartDate(
                    medicine.getStartDate() == null
                            ? null
                            : medicine.getStartDate().toString()
            );

            item.setEndDate(
                    medicine.getEndDate() == null
                            ? null
                            : medicine.getEndDate().toString()
            );

            item.setReminderTime(
                    medicine.getReminderTime() == null
                            ? null
                            : medicine.getReminderTime().toString()
            );

            item.setReminderTime2(
                    medicine.getReminderTime2() == null
                            ? null
                            : medicine.getReminderTime2().toString()
            );

            item.setReminderTime3(
                    medicine.getReminderTime3() == null
                            ? null
                            : medicine.getReminderTime3().toString()
            );

            item.setInstructions(medicine.getInstructions());

            item.setStatus(
                    medicine.getStatus() == null
                            ? null
                            : medicine.getStatus().toString()
            );

            medicineResponses.add(item);
        }

        response.setMedicines(medicineResponses);

        // =====================================================
        // 12. TODAY'S MEDICINE SCHEDULE
        // =====================================================

        LocalDate today =
                LocalDate.now(ZoneId.of("Asia/Kolkata"));

        List<MedicineLog> todayLogs =
                medicineLogRepository
                        .findByMedicine_User_IdAndScheduledDate(
                                patientUserId,
                                today
                        );

        List<FamilyMedicineLogResponse> todaySchedule =
                new ArrayList<>();

        for (MedicineLog log : todayLogs) {

            FamilyMedicineLogResponse item =
                    new FamilyMedicineLogResponse();

            item.setId(log.getId());

            if (log.getMedicine() != null) {

                item.setMedicineId(
                        log.getMedicine().getId()
                );

                item.setMedicineName(
                        log.getMedicine().getMedicineName()
                );

                item.setDosage(
                        log.getMedicine().getDosage()
                );
            }

            item.setScheduledDate(
                    log.getScheduledDate() == null
                            ? null
                            : log.getScheduledDate().toString()
            );

            item.setScheduledTime(
                    log.getScheduledTime() == null
                            ? null
                            : log.getScheduledTime().toString()
            );

            item.setStatus(
                    log.getStatus() == null
                            ? null
                            : log.getStatus().toString()
            );

            item.setTakenAt(
                    log.getTakenAt() == null
                            ? null
                            : log.getTakenAt().toString()
            );

            todaySchedule.add(item);
        }

        response.setTodayMedicineSchedule(todaySchedule);

        // =====================================================
        // 13. MOTHER'S VACCINATIONS
        // =====================================================

        List<Vaccination> vaccinations =
                vaccinationRepository
                        .findByUser_IdOrderByAvailableFromAsc(
                                patientUserId
                        );

        List<FamilyVaccinationResponse> vaccinationResponses =
                new ArrayList<>();

        for (Vaccination vaccination : vaccinations) {

            FamilyVaccinationResponse item =
                    new FamilyVaccinationResponse();

            item.setId(vaccination.getId());
            item.setVaccineName(
                    vaccination.getVaccineName()
            );

            item.setDoseNumber(vaccination.getDoseNumber());

            item.setAvailableFrom(
                    vaccination.getAvailableFrom() == null
                            ? null
                            : vaccination.getAvailableFrom().toString()
            );

            item.setScheduledDate(
                    vaccination.getScheduledDate() == null
                            ? null
                            : vaccination.getScheduledDate().toString()
            );

            item.setTakenDate(
                    vaccination.getTakenDate() == null
                            ? null
                            : vaccination.getTakenDate().toString()
            );

            item.setStatus(
                    vaccination.getStatus() == null
                            ? null
                            : vaccination.getStatus().toString()
            );

            item.setNotes(vaccination.getNotes());

            vaccinationResponses.add(item);
        }

        response.setVaccinations(vaccinationResponses);

        // =====================================================
        // 14. RETURN RESPONSE
        // =====================================================

        return response;
    }
}
