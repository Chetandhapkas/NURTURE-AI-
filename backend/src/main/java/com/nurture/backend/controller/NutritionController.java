package com.nurture.backend.controller;

import com.nurture.backend.dto.NutritionLogRequest;
import com.nurture.backend.dto.NutritionLogResponse;
import com.nurture.backend.entity.NutritionFood;
import com.nurture.backend.service.NutritionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {
    private final NutritionService nutritionService;

    public NutritionController(NutritionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @GetMapping("/foods")
    public List<NutritionFood> searchFoods(@RequestParam(required = false) String query) {
        return nutritionService.searchFoods(query);
    }

    @GetMapping("/logs/today")
    public List<NutritionLogResponse> getTodayLogs(@RequestParam Long userId) {
        return nutritionService.getTodayLogs(userId);
    }

    @PostMapping("/logs")
    @ResponseStatus(HttpStatus.CREATED)
    public NutritionLogResponse createLog(@RequestBody NutritionLogRequest request) {
        return nutritionService.createLog(request);
    }

    @DeleteMapping("/logs/{id}")
    public Map<String, String> deleteLog(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        nutritionService.deleteLog(id, userId);
        return Map.of("message", "Nutrition log deleted successfully.");
    }
}
