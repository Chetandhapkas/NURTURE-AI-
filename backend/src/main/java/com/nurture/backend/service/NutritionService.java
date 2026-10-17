package com.nurture.backend.service;

import com.nurture.backend.dto.NutritionLogRequest;
import com.nurture.backend.dto.NutritionLogResponse;
import com.nurture.backend.entity.NutritionFood;
import com.nurture.backend.entity.NutritionLog;
import com.nurture.backend.entity.NutritionLogItem;
import com.nurture.backend.repository.NutritionFoodRepository;
import com.nurture.backend.repository.NutritionLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class NutritionService {
    private final NutritionFoodRepository foodRepository;
    private final NutritionLogRepository logRepository;

    public NutritionService(NutritionFoodRepository foodRepository,
                            NutritionLogRepository logRepository) {
        this.foodRepository = foodRepository;
        this.logRepository = logRepository;
    }

    @Transactional(readOnly = true)
    public List<NutritionFood> searchFoods(String query) {
        String safeQuery = query == null ? "" : query.trim();
        if (safeQuery.isBlank()) {
            return foodRepository.findAll().stream()
                    .sorted((a, b) -> a.getFoodName().compareToIgnoreCase(b.getFoodName()))
                    .limit(30).toList();
        }
        return foodRepository.findTop30ByFoodNameContainingIgnoreCaseOrderByFoodNameAsc(safeQuery);
    }

    @Transactional
    public NutritionLogResponse createLog(NutritionLogRequest request) {
        if (request == null || request.userId() == null || request.userId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid userId is required.");
        }
        if (request.mealType() == null ||
                !List.of("Breakfast", "Lunch", "Dinner", "Snacks").contains(request.mealType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid meal type.");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add at least one food item.");
        }

        NutritionLog log = new NutritionLog();
        log.setUserId(request.userId());
        log.setMealType(request.mealType());
        log.setNotes(request.notes() == null ? null : request.notes().trim());

        for (NutritionLogRequest.FoodItemRequest input : request.items()) {
            if (input == null || input.foodId() == null ||
                    input.quantityGrams() == null ||
                    input.quantityGrams().compareTo(BigDecimal.ZERO) <= 0 ||
                    input.quantityGrams().compareTo(new BigDecimal("10000")) > 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Each food needs a valid foodId and quantity between 0 and 10000 grams."
                );
            }

            NutritionFood food = foodRepository.findById(input.foodId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Food not found: " + input.foodId()
                    ));

            BigDecimal factor = input.quantityGrams().divide(new BigDecimal("100"), 8, RoundingMode.HALF_UP);
            NutritionLogItem item = new NutritionLogItem();
            item.setFoodId(food.getId());
            item.setFoodName(food.getFoodName());
            item.setQuantityGrams(input.quantityGrams().setScale(2, RoundingMode.HALF_UP));
            item.setCalories(total(food.getCaloriesPer100g(), factor));
            item.setProtein(total(food.getProteinPer100g(), factor));
            item.setCarbs(total(food.getCarbsPer100g(), factor));
            item.setFat(total(food.getFatPer100g(), factor));
            item.setFiber(total(food.getFiberPer100g(), factor));
            item.setIron(total(food.getIronMgPer100g(), factor));
            item.setCalcium(total(food.getCalciumMgPer100g(), factor));
            log.addItem(item);
        }

        return NutritionLogResponse.from(logRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<NutritionLogResponse> getTodayLogs(Long userId) {
        validateUserId(userId);
        return logRepository.findByUserIdAndLogDateOrderByCreatedAtDesc(userId, LocalDate.now(ZoneId.of("Asia/Kolkata")))
                .stream().map(NutritionLogResponse::from).toList();
    }

    @Transactional
    public void deleteLog(Long logId, Long userId) {
        validateUserId(userId);
        NutritionLog log = logRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Nutrition log not found for this user."
                ));
        logRepository.delete(log);
    }

    private void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid userId is required.");
        }
    }

    private BigDecimal total(BigDecimal per100g, BigDecimal factor) {
        return per100g.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }
}
