package com.nurture.backend.dto;

import com.nurture.backend.entity.NutritionFood;
import com.nurture.backend.entity.NutritionLog;
import com.nurture.backend.entity.NutritionLogItem;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record NutritionLogResponse(
        Long id,
        Long userId,
        String mealType,
        String notes,
        LocalDate logDate,
        LocalDateTime createdAt,
        List<Item> items
) {
    public record Item(
            Long id,
            Long foodId,
            String foodName,
            BigDecimal quantityGrams,
            BigDecimal calories,
            BigDecimal protein,
            BigDecimal carbs,
            BigDecimal fat,
            BigDecimal fiber,
            BigDecimal iron,
            BigDecimal calcium
    ) {}

    public static NutritionLogResponse from(NutritionLog log) {
        List<Item> items = log.getItems().stream().map(item -> new Item(
                item.getId(), item.getFoodId(), item.getFoodName(), item.getQuantityGrams(),
                item.getCalories(), item.getProtein(), item.getCarbs(), item.getFat(),
                item.getFiber(), item.getIron(), item.getCalcium()
        )).toList();

        return new NutritionLogResponse(
                log.getId(), log.getUserId(), log.getMealType(), log.getNotes(),
                log.getLogDate(), log.getCreatedAt(), items
        );
    }
}
