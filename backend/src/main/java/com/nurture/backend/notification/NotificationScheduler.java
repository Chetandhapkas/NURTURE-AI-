package com.nurture.backend.notification;

import com.nurture.backend.entity.Appointment;
import com.nurture.backend.entity.MedicineLog;
import com.nurture.backend.entity.Vaccination;

import com.nurture.backend.repository.AppointmentRepository;
import com.nurture.backend.repository.MedicineLogRepository;
import com.nurture.backend.repository.VaccinationRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class NotificationScheduler {

    private final MedicineLogRepository medicineLogRepository;
    private final AppointmentRepository appointmentRepository;
    private final VaccinationRepository vaccinationRepository;
    private final NotificationService notificationService;

    private static final ZoneId ZONE =
            ZoneId.of("Asia/Kolkata");

    private static final LocalTime REMINDER_TIME =
            LocalTime.of(9, 0);

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("hh:mm a");

    public NotificationScheduler(
            MedicineLogRepository medicineLogRepository,
            AppointmentRepository appointmentRepository,
            VaccinationRepository vaccinationRepository,
            NotificationService notificationService
    ) {
        this.medicineLogRepository = medicineLogRepository;
        this.appointmentRepository = appointmentRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.notificationService = notificationService;
    }

    /*
     * Check notifications every minute.
     */
    @Scheduled(cron = "0 * * * * *")
    public void checkNotifications() {

        System.out.println(
                "Checking NURTURE AI notifications..."
        );

        checkMedicineNotifications();
        checkAppointmentNotifications();
        checkVaccinationNotifications();
    }

    /*
     * MEDICINE REMINDER
     *
     * Send at the scheduled medicine date and time.
     * Only send for PENDING medicine logs.
     */
    private void checkMedicineNotifications() {

        List<MedicineLog> logs =
                medicineLogRepository.findAll();

        LocalDateTime currentMinute =
                LocalDateTime.now(ZONE)
                        .withSecond(0)
                        .withNano(0);

        for (MedicineLog log : logs) {

            if (log.getScheduledDate() == null) {
                continue;
            }

            if (log.getScheduledTime() == null) {
                continue;
            }

            if (!"PENDING".equalsIgnoreCase(log.getStatus())) {
                continue;
            }

            if (log.getMedicine() == null ||
                    log.getMedicine().getUser() == null) {
                continue;
            }

            LocalDateTime scheduledDateTime =
                    LocalDateTime.of(
                            log.getScheduledDate(),
                            log.getScheduledTime()
                    ).withSecond(0).withNano(0);

            // Send only when both date and time match.
            if (!scheduledDateTime.equals(currentMinute)) {
                continue;
            }

            Long userId =
                    log.getMedicine()
                            .getUser()
                            .getId();

            if (userId == null) {
                continue;
            }

            String medicineName =
                    log.getMedicine()
                            .getMedicineName();

            String dosage =
                    log.getMedicine()
                            .getDosage();

            String body =
                    "It's time to take " + medicineName;

            if (dosage != null && !dosage.isBlank()) {
                body += " (" + dosage + ")";
            }

            boolean sent =
                    notificationService.sendNotification(
                            userId,
                            "MEDICINE",
                            log.getId(),
                            "Medicine Reminder",
                            body
                    );

            if (sent) {
                System.out.println(
                        "Medicine reminder sent for log ID: "
                                + log.getId()
                );
            }
        }
    }

    /*
     * APPOINTMENT REMINDER
     *
     * Send one day before the appointment at 9:00 AM.
     */
    private void checkAppointmentNotifications() {

        LocalDate today =
                LocalDate.now(ZONE);

        LocalDate tomorrow =
                today.plusDays(1);

        LocalTime now =
                LocalTime.now(ZONE);

        if (!isCurrentMinute(REMINDER_TIME, now)) {
            return;
        }

        List<Appointment> appointments =
                appointmentRepository.findAll();

        for (Appointment appointment : appointments) {

            if (appointment.getAppointmentDate() == null ||
                    appointment.getAppointmentTime() == null) {
                continue;
            }

            if (!tomorrow.equals(
                    appointment.getAppointmentDate())) {
                continue;
            }

            if (!"UPCOMING".equalsIgnoreCase(
                    appointment.getStatus())) {
                continue;
            }

            Long userId = appointment.getUserId();

            if (userId == null) {
                continue;
            }

            String doctorName =
                    appointment.getDoctorName();

            String date =
                    appointment.getAppointmentDate()
                            .format(DATE_FORMAT);

            String time =
                    appointment.getAppointmentTime()
                            .format(TIME_FORMAT);

            String body =
                    "Reminder: Your appointment with "
                            + doctorName
                            + " is tomorrow, "
                            + date
                            + " at "
                            + time
                            + ".";

            boolean sent =
                    notificationService.sendNotification(
                            userId,
                            "APPOINTMENT",
                            appointment.getId(),
                            "Appointment Tomorrow",
                            body
                    );

            if (sent) {
                System.out.println(
                        "Appointment reminder sent for ID: "
                                + appointment.getId()
                );
            }
        }
    }

    /*
     * VACCINATION REMINDER
     *
     * Send one day before vaccination at 9:00 AM.
     */
    private void checkVaccinationNotifications() {

        LocalDate today =
                LocalDate.now(ZONE);

        LocalDate tomorrow =
                today.plusDays(1);

        LocalTime now =
                LocalTime.now(ZONE);

        if (!isCurrentMinute(REMINDER_TIME, now)) {
            return;
        }

        List<Vaccination> vaccinations =
                vaccinationRepository.findAll();

        for (Vaccination vaccination : vaccinations) {

            if (vaccination.getScheduledDate() == null) {
                continue;
            }

            if (!tomorrow.equals(
                    vaccination.getScheduledDate())) {
                continue;
            }

            if ("COMPLETED".equalsIgnoreCase(
                    vaccination.getStatus())) {
                continue;
            }

            if (vaccination.getUser() == null) {
                continue;
            }

            Long userId =
                    vaccination.getUser()
                            .getId();

            if (userId == null) {
                continue;
            }

            String vaccineName =
                    vaccination.getVaccineName();

            String doseNumber =
                    vaccination.getDoseNumber();

            String date =
                    vaccination.getScheduledDate()
                            .format(DATE_FORMAT);

            String body =
                    "Reminder: Your vaccination "
                            + vaccineName
                            + " is scheduled for tomorrow, "
                            + date
                            + ".";

            if (doseNumber != null && !doseNumber.isBlank()) {
                body += " Dose: " + doseNumber;
            }

            boolean sent =
                    notificationService.sendNotification(
                            userId,
                            "VACCINATION",
                            vaccination.getId(),
                            "Vaccination Tomorrow",
                            body
                    );

            if (sent) {
                System.out.println(
                        "Vaccination reminder sent for ID: "
                                + vaccination.getId()
                );
            }
        }
    }

    /*
     * Compare hour and minute.
     */
    private boolean isCurrentMinute(
            LocalTime scheduledTime,
            LocalTime currentTime
    ) {
        return scheduledTime.getHour() == currentTime.getHour()
                && scheduledTime.getMinute() == currentTime.getMinute();
    }
}