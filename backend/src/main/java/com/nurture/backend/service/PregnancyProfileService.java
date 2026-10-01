package com.nurture.backend.service;

import com.nurture.backend.dto.PregnancyProfileRequest;
import com.nurture.backend.entity.Login;
import com.nurture.backend.entity.PregnancyProfile;
import com.nurture.backend.repository.LoginRepository;
import com.nurture.backend.repository.PregnancyProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class PregnancyProfileService {

    @Autowired
    private PregnancyProfileRepository repository;

    @Autowired
    private LoginRepository loginRepository;


    // =========================================================
    // SAVE OR UPDATE PREGNANCY PROFILE
    // =========================================================

    public PregnancyProfile save(PregnancyProfileRequest request) {

        Login user = loginRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        PregnancyProfile profile =
                repository.findByUser_Id(request.getUserId())
                        .orElse(new PregnancyProfile());

        profile.setUser(user);


        // =====================================================
        // PREGNANCY INFORMATION
        // =====================================================

        profile.setDueDate(request.getDueDate());

        profile.setLastMenstrualPeriod(
                request.getLastMenstrualPeriod()
        );

        profile.setPregnancyType(
                request.getPregnancyType()
        );

        profile.setBabyCount(
                request.getBabyCount()
        );

        profile.setDoctorNotes(
                request.getDoctorNotes()
        );


        // =====================================================
        // CALCULATE CURRENT PREGNANCY WEEK
        // FROM LMP
        // =====================================================

        LocalDate lmp =
                request.getLastMenstrualPeriod();

        Integer currentWeek =
                request.getPregnancyWeek();

        String currentTrimester =
                request.getTrimester();


        if (lmp != null) {

            LocalDate today =
                    LocalDate.now();

            long daysPregnant =
                    ChronoUnit.DAYS.between(
                            lmp,
                            today
                    );


            // =================================================
            // CALCULATE WEEK
            // =================================================

            if (daysPregnant >= 0) {

                currentWeek =
                        (int) (daysPregnant / 7);


                // =================================================
                // CALCULATE TRIMESTER
                // =================================================

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
            }
        }


        // =====================================================
        // SAVE CALCULATED VALUES
        // =====================================================

        profile.setPregnancyWeek(
                currentWeek
        );

        profile.setTrimester(
                currentTrimester
        );


        // =====================================================
        // PREGNANCY HISTORY
        // =====================================================

        profile.setFirstPregnancy(
                request.getFirstPregnancy()
        );

        profile.setPreviousPregnancies(
                request.getPreviousPregnancies()
        );

        profile.setLiveBirths(
                request.getLiveBirths()
        );

        profile.setMiscarriages(
                request.getMiscarriages()
        );


        // =====================================================
        // RISK DETAILS
        // =====================================================

        profile.setHighRisk(
                request.getHighRisk()
        );

        profile.setIvfPregnancy(
                request.getIvfPregnancy()
        );

        profile.setMultiplePregnancy(
                request.getMultiplePregnancy()
        );


        // =====================================================
        // SAVE TO DATABASE
        // =====================================================

        return repository.save(profile);
    }


    // =========================================================
    // GET PREGNANCY PROFILE BY USER ID
    // =========================================================

    public PregnancyProfile getProfile(Long userId) {

        return repository.findByUser_Id(userId)
                .orElse(null);
    }


    // =========================================================
    // CHECK IF PREGNANCY PROFILE EXISTS
    // =========================================================

    public boolean exists(Long userId) {

        return repository.existsByUser_Id(userId);
    }
}