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

    // Runs every minute.
    @Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
    public void checkNotifications() {

        LocalDateTime now = LocalDateTime.now(ZONE)
                .withSecond(0)
                .withNano(0);

        System.out.println();
        System.out.println("==========================================");
        System.out.println("Checking NURTURE AI notifications...");
        System.out.println("Scheduler time: " + now);
        System.out.println("==========================================");

        // One category failing must not prevent the other checks.
        try {
            checkMedicineNotifications();
        } catch (Exception e) {
            System.err.println("Medicine scheduler failed: "
                    + e.getMessage());
            e.printStackTrace();
        }

        try {
            checkAppointmentNotifications();
        } catch (Exception e) {
            System.err.println("Appointment scheduler failed: "
                    + e.getMessage());
            e.printStackTrace();
        }

        try {
            checkVaccinationNotifications();
        } catch (Exception e) {
            System.err.println("Vaccination scheduler failed: "
                    + e.getMessage());
            e.printStackTrace();
        }
    }

    // MEDICINE REMINDERS
    private void checkMedicineNotifications() {

        List<MedicineLog> logs = medicineLogRepository.findAll();

        LocalDateTime now = LocalDateTime.now(ZONE)
                .withSecond(0)
                .withNano(0);

        LocalDate today = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();

        System.out.println("Medicine scheduler time: " + now);
        System.out.println("Total medicine logs: " + logs.size());

        for (MedicineLog log : logs) {

            try {
                System.out.println();
                System.out.println("========== MEDICINE LOG CHECK ==========");
                System.out.println("Medicine Log ID: " + log.getId());
                System.out.println("Scheduled Date: "
                        + log.getScheduledDate());
                System.out.println("Scheduled Time: "
                        + log.getScheduledTime());
                System.out.println("Status: " + log.getStatus());

                if (log.getMedicine() == null) {
                    System.out.println("SKIPPED: Medicine is null");
                    continue;
                }

                String medicineName =
                        log.getMedicine().getMedicineName();

                if (log.getMedicine().getUser() == null) {
                    System.out.println("SKIPPED: User is null");
                    continue;
                }

                Long userId = log.getMedicine().getUser().getId();

                System.out.println("Medicine Name: " + medicineName);
                System.out.println("User ID: " + userId);

                if (log.getScheduledDate() == null) {
                    System.out.println(
                            "SKIPPED: Scheduled date is null");
                    continue;
                }

                if (!today.equals(log.getScheduledDate())) {
                    System.out.println(
                            "SKIPPED: Scheduled date is not today");
                    continue;
                }

                if (log.getScheduledTime() == null) {
                    System.out.println(
                            "SKIPPED: Scheduled time is null");
                    continue;
                }

                if (!"PENDING".equalsIgnoreCase(log.getStatus())) {
                    System.out.println(
                            "SKIPPED: Status is not PENDING");
                    continue;
                }

                LocalTime scheduledTime = log.getScheduledTime();

                System.out.println("Current Time: " + currentTime);
                System.out.println("Scheduled Time: " + scheduledTime);

                if (scheduledTime.isAfter(currentTime)) {
                    System.out.println(
                            "SKIPPED: Medicine time has not arrived yet");
                    continue;
                }

                // NotificationService checks notification history
                // to prevent resending an already recorded notification.
                long minutesLate = java.time.Duration.between(
                        scheduledTime,
                        currentTime
                ).toMinutes();

                System.out.println(
                        "Medicine reminder is due. Minutes late: "
                                + minutesLate);

                String dosage = log.getMedicine().getDosage();

                String body = "It's time to take " + medicineName;

                if (dosage != null && !dosage.isBlank()) {
                    body += " (" + dosage + ")";
                }

                System.out.println("MEDICINE REMINDER MATCHED!");
                System.out.println("Sending notification...");

                boolean sent = notificationService.sendNotification(
                        userId,
                        "MEDICINE",
                        log.getId(),
                        "Medicine Reminder",
                        body
                );

                if (sent) {
                    System.out.println(
                            "Medicine reminder sent successfully!");
                } else {
                    System.out.println(
                            "Medicine reminder not sent. Check the "
                                    + "NotificationService logs and "
                                    + "notification history.");
                }

                System.out.println(
                        "========== END MEDICINE CHECK ==========");

            } catch (Exception e) {
                System.err.println(
                        "Failed to process medicine log ID "
                                + log.getId() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    // APPOINTMENT REMINDERS
    // Sends one day before an appointment at 09:00 AM.
    private void checkAppointmentNotifications() {

        LocalDate today = LocalDate.now(ZONE);
        LocalDate tomorrow = today.plusDays(1);
        LocalTime now = LocalTime.now(ZONE);

        if (!isCurrentMinute(REMINDER_TIME, now)) {
            return;
        }

        List<Appointment> appointments =
                appointmentRepository.findAll();

        System.out.println("Checking appointment reminders...");

        for (Appointment appointment : appointments) {

            try {
                if (appointment.getAppointmentDate() == null
                        || appointment.getAppointmentTime() == null) {
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

                String doctorName = appointment.getDoctorName();

                String date = appointment.getAppointmentDate()
                        .format(DATE_FORMAT);

                String time = appointment.getAppointmentTime()
                        .format(TIME_FORMAT);

                String body = "Reminder: Your appointment with "
                        + doctorName + " is tomorrow, "
                        + date + " at " + time + ".";

                boolean sent = notificationService.sendNotification(
                        userId,
                        "APPOINTMENT",
                        appointment.getId(),
                        "Appointment Tomorrow",
                        body
                );

                System.out.println(
                        sent
                                ? "Appointment reminder sent successfully."
                                : "Appointment reminder was not sent."
                );

            } catch (Exception e) {
                System.err.println(
                        "Failed to process appointment ID "
                                + appointment.getId() + ": "
                                + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    // VACCINATION REMINDERS
    // Sends one day before vaccination at 09:00 AM.
    private void checkVaccinationNotifications() {

        LocalDate today = LocalDate.now(ZONE);
        LocalDate tomorrow = today.plusDays(1);
        LocalTime now = LocalTime.now(ZONE);

        if (!isCurrentMinute(REMINDER_TIME, now)) {
            return;
        }

        List<Vaccination> vaccinations =
                vaccinationRepository.findAll();

        System.out.println("Checking vaccination reminders...");

        for (Vaccination vaccination : vaccinations) {

            try {
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

                Long userId = vaccination.getUser().getId();

                if (userId == null) {
                    continue;
                }

                String vaccineName = vaccination.getVaccineName();
                String doseNumber = vaccination.getDoseNumber();

                String date = vaccination.getScheduledDate()
                        .format(DATE_FORMAT);

                String body = "Reminder: Your vaccination "
                        + vaccineName
                        + " is scheduled for tomorrow, "
                        + date + ".";

                if (doseNumber != null && !doseNumber.isBlank()) {
                    body += " Dose: " + doseNumber;
                }

                boolean sent = notificationService.sendNotification(
                        userId,
                        "VACCINATION",
                        vaccination.getId(),
                        "Vaccination Tomorrow",
                        body
                );

                System.out.println(
                        sent
                                ? "Vaccination reminder sent successfully."
                                : "Vaccination reminder was not sent."
                );

            } catch (Exception e) {
                System.err.println(
                        "Failed to process vaccination ID "
                                + vaccination.getId() + ": "
                                + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    private boolean isCurrentMinute(
            LocalTime scheduledTime,
            LocalTime currentTime
    ) {
        return scheduledTime.getHour() == currentTime.getHour()
                && scheduledTime.getMinute() == currentTime.getMinute();
    }
}
