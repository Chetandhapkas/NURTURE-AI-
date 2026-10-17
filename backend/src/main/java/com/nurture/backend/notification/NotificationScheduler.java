package com.nurture.backend.notification;

import com.nurture.backend.entity.Appointment;
import com.nurture.backend.entity.MedicineLog;
import com.nurture.backend.entity.Vaccination;
import com.nurture.backend.repository.AppointmentRepository;
import com.nurture.backend.repository.MedicineLogRepository;
import com.nurture.backend.repository.VaccinationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
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

    /*
     * Appointment and vaccination reminder time.
     *
     * 09:00 AM every day.
     */
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

        this.medicineLogRepository =
                medicineLogRepository;

        this.appointmentRepository =
                appointmentRepository;

        this.vaccinationRepository =
                vaccinationRepository;

        this.notificationService =
                notificationService;
    }

    /*
     * ============================================================
     * MAIN SCHEDULER
     * ============================================================
     *
     * Runs every minute.
     */
    @Scheduled(cron = "0 * * * * *")
    public void checkNotifications() {

        LocalDateTime now =
                LocalDateTime.now(ZONE)
                        .withSecond(0)
                        .withNano(0);

        System.out.println();
        System.out.println(
                "=========================================="
        );

        System.out.println(
                "Checking NURTURE AI notifications..."
        );

        System.out.println(
                "Scheduler time: " + now
        );

        System.out.println(
                "=========================================="
        );

        checkMedicineNotifications();

        checkAppointmentNotifications();

        checkVaccinationNotifications();
    }

    /*
     * ============================================================
     * MEDICINE REMINDER
     * ============================================================
     *
     * Medicine reminder is sent when:
     *
     * - Scheduled date = today
     * - Scheduled time has arrived
     * - Status = PENDING
     * - Reminder is not older than 2 minutes
     *
     * Detailed logs are added here to find exactly why a
     * medicine reminder is being skipped.
     */
    private void checkMedicineNotifications() {

        List<MedicineLog> logs =
                medicineLogRepository.findAll();

        LocalDateTime now =
                LocalDateTime.now(ZONE)
                        .withSecond(0)
                        .withNano(0);

        LocalDate today =
                now.toLocalDate();

        LocalTime currentTime =
                now.toLocalTime();

        System.out.println(
                "Medicine scheduler time: "
                        + now
        );

        System.out.println(
                "Total medicine logs: "
                        + logs.size()
        );

        for (MedicineLog log : logs) {

            System.out.println();
            System.out.println(
                    "========== MEDICINE LOG CHECK =========="
            );

            /*
             * ----------------------------------------------------
             * LOG ID
             * ----------------------------------------------------
             */
            System.out.println(
                    "Medicine Log ID: "
                            + log.getId()
            );

            /*
             * ----------------------------------------------------
             * SCHEDULED DATE
             * ----------------------------------------------------
             */
            System.out.println(
                    "Scheduled Date: "
                            + log.getScheduledDate()
            );

            /*
             * ----------------------------------------------------
             * SCHEDULED TIME
             * ----------------------------------------------------
             */
            System.out.println(
                    "Scheduled Time: "
                            + log.getScheduledTime()
            );

            /*
             * ----------------------------------------------------
             * STATUS
             * ----------------------------------------------------
             */
            System.out.println(
                    "Status: "
                            + log.getStatus()
            );

            /*
             * ----------------------------------------------------
             * MEDICINE
             * ----------------------------------------------------
             */
            if (log.getMedicine() == null) {

                System.out.println(
                        "SKIPPED: Medicine is null"
                );

                continue;
            }

            System.out.println(
                    "Medicine ID: "
                            + log.getMedicine().getId()
            );

            System.out.println(
                    "Medicine Name: "
                            + log.getMedicine()
                            .getMedicineName()
            );

            /*
             * ----------------------------------------------------
             * USER
             * ----------------------------------------------------
             */
            if (log.getMedicine().getUser() == null) {

                System.out.println(
                        "SKIPPED: User is null"
                );

                continue;
            }

            Long userId =
                    log.getMedicine()
                            .getUser()
                            .getId();

            System.out.println(
                    "User ID: "
                            + userId
            );

            /*
             * ----------------------------------------------------
             * SCHEDULED DATE CHECK
             * ----------------------------------------------------
             */
            if (log.getScheduledDate() == null) {

                System.out.println(
                        "SKIPPED: Scheduled date is null"
                );

                continue;
            }

            if (!today.equals(
                    log.getScheduledDate())) {

                System.out.println(
                        "SKIPPED: Scheduled date is not today"
                );

                System.out.println(
                        "Today: "
                                + today
                );

                System.out.println(
                        "Scheduled: "
                                + log.getScheduledDate()
                );

                continue;
            }

            /*
             * ----------------------------------------------------
             * SCHEDULED TIME CHECK
             * ----------------------------------------------------
             */
            if (log.getScheduledTime() == null) {

                System.out.println(
                        "SKIPPED: Scheduled time is null"
                );

                continue;
            }

            LocalTime scheduledTime =
                    log.getScheduledTime();

            System.out.println(
                    "Current Time: "
                            + currentTime
            );

            System.out.println(
                    "Scheduled Time: "
                            + scheduledTime
            );

            /*
             * ----------------------------------------------------
             * STATUS CHECK
             * ----------------------------------------------------
             */
            if (!"PENDING".equalsIgnoreCase(
                    log.getStatus())) {

                System.out.println(
                        "SKIPPED: Status is not PENDING"
                );

                continue;
            }

            /*
             * ----------------------------------------------------
             * TIME ARRIVAL CHECK
             * ----------------------------------------------------
             */
            if (scheduledTime.isAfter(
                    currentTime)) {

                System.out.println(
                        "SKIPPED: Medicine time has not arrived yet"
                );

                continue;
            }

            /*
             * ----------------------------------------------------
             * TIME DIFFERENCE
             * ----------------------------------------------------
             */
            long minutesDifference =
                    Duration.between(
                            scheduledTime,
                            currentTime
                    ).toMinutes();

            System.out.println(
                    "Minutes difference: "
                            + minutesDifference
            );

            /*
             * ----------------------------------------------------
             * OLD REMINDER CHECK
             * ----------------------------------------------------
             */
            if (minutesDifference > 2) {

                System.out.println(
                        "SKIPPED: Reminder is older than 2 minutes"
                );

                continue;
            }

            /*
             * ----------------------------------------------------
             * MEDICINE INFORMATION
             * ----------------------------------------------------
             */
            String medicineName =
                    log.getMedicine()
                            .getMedicineName();

            String dosage =
                    log.getMedicine()
                            .getDosage();

            /*
             * ----------------------------------------------------
             * NOTIFICATION BODY
             * ----------------------------------------------------
             */
            String body =
                    "It's time to take "
                            + medicineName;

            if (dosage != null &&
                    !dosage.isBlank()) {

                body +=
                        " (" + dosage + ")";
            }

            /*
             * ----------------------------------------------------
             * MATCHED
             * ----------------------------------------------------
             */
            System.out.println();
            System.out.println(
                    "****************************************"
            );

            System.out.println(
                    "MEDICINE REMINDER MATCHED!"
            );

            System.out.println(
                    "Medicine Log ID: "
                            + log.getId()
            );

            System.out.println(
                    "User ID: "
                            + userId
            );

            System.out.println(
                    "Medicine: "
                            + medicineName
            );

            System.out.println(
                    "Scheduled Time: "
                            + scheduledTime
            );

            System.out.println(
                    "Current Time: "
                            + currentTime
            );

            System.out.println(
                    "Sending notification..."
            );

            System.out.println(
                    "****************************************"
            );

            /*
             * ----------------------------------------------------
             * SEND NOTIFICATION
             * ----------------------------------------------------
             */
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
                        "Medicine reminder sent successfully!"
                );

            } else {

                System.out.println(
                        "Medicine reminder was NOT sent."
                );
            }

            System.out.println(
                    "========== END MEDICINE CHECK =========="
            );
        }
    }

    /*
     * ============================================================
     * APPOINTMENT REMINDER
     * ============================================================
     *
     * Sends one day before appointment at 09:00 AM.
     */
    private void checkAppointmentNotifications() {

        LocalDate today =
                LocalDate.now(ZONE);

        LocalDate tomorrow =
                today.plusDays(1);

        LocalTime now =
                LocalTime.now(ZONE);

        /*
         * Only run around 09:00 AM.
         */
        if (!isCurrentMinute(
                REMINDER_TIME,
                now)) {

            return;
        }

        List<Appointment> appointments =
                appointmentRepository.findAll();

        System.out.println(
                "Checking appointment reminders..."
        );

        for (Appointment appointment :
                appointments) {

            if (appointment.getAppointmentDate() == null ||
                    appointment.getAppointmentTime() == null) {

                continue;
            }

            /*
             * Appointment must be tomorrow.
             */
            if (!tomorrow.equals(
                    appointment.getAppointmentDate())) {

                continue;
            }

            /*
             * Only upcoming appointments.
             */
            if (!"UPCOMING".equalsIgnoreCase(
                    appointment.getStatus())) {

                continue;
            }

            Long userId =
                    appointment.getUserId();

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
                        "Appointment reminder sent successfully."
                );

            } else {

                System.out.println(
                        "Appointment reminder was not sent."
                );
            }
        }
    }

    /*
     * ============================================================
     * VACCINATION REMINDER
     * ============================================================
     *
     * Sends one day before vaccination at 09:00 AM.
     */
    private void checkVaccinationNotifications() {

        LocalDate today =
                LocalDate.now(ZONE);

        LocalDate tomorrow =
                today.plusDays(1);

        LocalTime now =
                LocalTime.now(ZONE);

        /*
         * Only run around 09:00 AM.
         */
        if (!isCurrentMinute(
                REMINDER_TIME,
                now)) {

            return;
        }

        List<Vaccination> vaccinations =
                vaccinationRepository.findAll();

        System.out.println(
                "Checking vaccination reminders..."
        );

        for (Vaccination vaccination :
                vaccinations) {

            if (vaccination.getScheduledDate() == null) {

                continue;
            }

            /*
             * Vaccination must be tomorrow.
             */
            if (!tomorrow.equals(
                    vaccination.getScheduledDate())) {

                continue;
            }

            /*
             * Completed vaccination should not notify.
             */
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

            if (doseNumber != null &&
                    !doseNumber.isBlank()) {

                body +=
                        " Dose: "
                                + doseNumber;
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
                        "Vaccination reminder sent successfully."
                );

            } else {

                System.out.println(
                        "Vaccination reminder was not sent."
                );
            }
        }
    }

    /*
     * ============================================================
     * CHECK CURRENT MINUTE
     * ============================================================
     */
    private boolean isCurrentMinute(
            LocalTime scheduledTime,
            LocalTime currentTime
    ) {

        return scheduledTime.getHour()
                == currentTime.getHour()
                &&
                scheduledTime.getMinute()
                        == currentTime.getMinute();
    }
}