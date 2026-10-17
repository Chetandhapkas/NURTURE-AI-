package com.nurture.backend.repository;

import com.nurture.backend.entity.NutritionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NutritionLogRepository extends JpaRepository<NutritionLog, Long> {
    List<NutritionLog> findByUserIdAndLogDateOrderByCreatedAtDesc(Long userId, LocalDate logDate);
    Optional<NutritionLog> findByIdAndUserId(Long id, Long userId);
}
