package com.nurture.backend.service;

import com.nurture.backend.entity.PregnancyProfile;
import com.nurture.backend.repository.PregnancyProfileRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class PregnancyWeekUpdateService {

    private final PregnancyProfileRepository repository;

    public PregnancyWeekUpdateService(
            PregnancyProfileRepository repository
    ) {
        this.repository = repository;
    }


    // =========================================================
    // RUN WHEN BACKEND STARTS
    // =========================================================

    @EventListener(ApplicationReadyEvent.class)
    public void updateOnStartup() {

        System.out.println(
                "========================================"
        );

        System.out.println(
                "PREGNANCY UPDATE ON BACKEND START"
        );

        updatePregnancyWeeks();

        System.out.println(
                "========================================"
        );
    }


    // =========================================================
    // RUN EVERY DAY AT 12:05 AM
    // =========================================================

    @Scheduled(cron = "0 5 0 * * *")
    public void updatePregnancyWeeks() {

        LocalDate today = LocalDate.now();

        System.out.println(
                "AUTOMATIC PREGNANCY UPDATE"
        );

        System.out.println(
                "DATE: " + today
        );


        List<PregnancyProfile> profiles =
                repository.findAll();


        for (PregnancyProfile profile : profiles) {

            LocalDate lmp =
                    profile.getLastMenstrualPeriod();


            // -------------------------------------------------
            // NO LMP
            // -------------------------------------------------

            if (lmp == null) {
                continue;
            }


            // -------------------------------------------------
            // FUTURE LMP
            // -------------------------------------------------

            long daysPregnant =
                    ChronoUnit.DAYS.between(
                            lmp,
                            today
                    );

            if (daysPregnant < 0) {
                continue;
            }


            // =================================================
            // CURRENT WEEK
            // =================================================

            int currentWeek =
                    (int) (daysPregnant / 7);


            // =================================================
            // CURRENT TRIMESTER
            // =================================================

            String currentTrimester;

            if (currentWeek <= 13) {

                currentTrimester =
                        "First Trimester";

            } else if (currentWeek <= 27) {

                currentTrimester =
                        "Second Trimester";

            } else {

                currentTrimester =
                        "Third Trimester";
            }


            // =================================================
            // UPDATE DATABASE
            // =================================================

            boolean changed = false;


            if (profile.getPregnancyWeek() == null
                    || profile.getPregnancyWeek() != currentWeek) {

                profile.setPregnancyWeek(
                        currentWeek
                );

                changed = true;
            }


            if (profile.getTrimester() == null
                    || !profile.getTrimester()
                    .equals(currentTrimester)) {

                profile.setTrimester(
                        currentTrimester
                );

                changed = true;
            }


            // =================================================
            // SAVE ONLY WHEN NEEDED
            // =================================================

            if (changed) {

                repository.save(profile);

                System.out.println(
                        "UPDATED USER: "
                                + profile.getUser().getId()
                );

                System.out.println(
                        "LMP: " + lmp
                );

                System.out.println(
                        "WEEK: " + currentWeek
                );

                System.out.println(
                        "TRIMESTER: "
                                + currentTrimester
                );
            }
        }
    }
}