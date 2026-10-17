package com.nurture.backend.repository;

import com.nurture.backend.entity.NutritionFood;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NutritionFoodRepository extends JpaRepository<NutritionFood, Long> {
    List<NutritionFood> findTop30ByFoodNameContainingIgnoreCaseOrderByFoodNameAsc(String query);
    Optional<NutritionFood> findByFoodNameIgnoreCase(String foodName);
}
