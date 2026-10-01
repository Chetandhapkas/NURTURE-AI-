package com.nurture.backend.repository;

import com.nurture.backend.entity.MedicineLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface MedicineLogRepository extends JpaRepository<MedicineLog, Long> {

    Optional<MedicineLog> findByMedicine_IdAndScheduledDateAndScheduledTime(
            Long medicineId,
            LocalDate scheduledDate,
            LocalTime scheduledTime
    );

    List<MedicineLog> findByMedicine_User_IdAndScheduledDate(
            Long userId,
            LocalDate scheduledDate
    );

    List<MedicineLog> findByScheduledDate(
            LocalDate scheduledDate
    );
}