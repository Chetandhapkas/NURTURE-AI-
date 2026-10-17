package com.nurture.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "nutrition_foods")
public class NutritionFood {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "food_name", nullable = false, unique = true, length = 120)
    private String foodName;

    @Column(name = "calories_per_100g", nullable = false, precision = 10, scale = 2)
    private BigDecimal caloriesPer100g = BigDecimal.ZERO;

    @Column(name = "protein_per_100g", nullable = false, precision = 10, scale = 2)
    private BigDecimal proteinPer100g = BigDecimal.ZERO;

    @Column(name = "carbs_per_100g", nullable = false, precision = 10, scale = 2)
    private BigDecimal carbsPer100g = BigDecimal.ZERO;

    @Column(name = "fat_per_100g", nullable = false, precision = 10, scale = 2)
    private BigDecimal fatPer100g = BigDecimal.ZERO;

    @Column(name = "fiber_per_100g", nullable = false, precision = 10, scale = 2)
    private BigDecimal fiberPer100g = BigDecimal.ZERO;

    @Column(name = "iron_mg_per_100g", nullable = false, precision = 10, scale = 2)
    private BigDecimal ironMgPer100g = BigDecimal.ZERO;

    @Column(name = "calcium_mg_per_100g", nullable = false, precision = 10, scale = 2)
    private BigDecimal calciumMgPer100g = BigDecimal.ZERO;

    public NutritionFood() {}

    public NutritionFood(String foodName, double calories, double protein, double carbs,
                         double fat, double fiber, double iron, double calcium) {
        this.foodName = foodName;
        this.caloriesPer100g = BigDecimal.valueOf(calories);
        this.proteinPer100g = BigDecimal.valueOf(protein);
        this.carbsPer100g = BigDecimal.valueOf(carbs);
        this.fatPer100g = BigDecimal.valueOf(fat);
        this.fiberPer100g = BigDecimal.valueOf(fiber);
        this.ironMgPer100g = BigDecimal.valueOf(iron);
        this.calciumMgPer100g = BigDecimal.valueOf(calcium);
    }

    public Long getId() { return id; }
    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }
    public BigDecimal getCaloriesPer100g() { return caloriesPer100g; }
    public BigDecimal getProteinPer100g() { return proteinPer100g; }
    public BigDecimal getCarbsPer100g() { return carbsPer100g; }
    public BigDecimal getFatPer100g() { return fatPer100g; }
    public BigDecimal getFiberPer100g() { return fiberPer100g; }
    public BigDecimal getIronMgPer100g() { return ironMgPer100g; }
    public BigDecimal getCalciumMgPer100g() { return calciumMgPer100g; }
}
