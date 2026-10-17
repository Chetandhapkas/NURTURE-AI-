package com.nurture.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record NutritionLogRequest(
        Long userId,
        String mealType,
        String notes,
        List<FoodItemRequest> items
) {
    public record FoodItemRequest(Long foodId, BigDecimal quantityGrams) {}
}
