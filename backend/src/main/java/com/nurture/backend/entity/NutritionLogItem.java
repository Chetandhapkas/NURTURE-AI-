package com.nurture.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "nutrition_log_items")
public class NutritionLogItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nutrition_log_id", nullable = false)
    private NutritionLog nutritionLog;

    @Column(name = "food_id", nullable = false)
    private Long foodId;

    @Column(name = "food_name", nullable = false, length = 120)
    private String foodName;

    @Column(name = "quantity_grams", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityGrams;

    // Nutrient totals for this specific quantity, stored as a snapshot.
    @Column(precision = 10, scale = 2) private BigDecimal calories;
    @Column(precision = 10, scale = 2) private BigDecimal protein;
    @Column(precision = 10, scale = 2) private BigDecimal carbs;
    @Column(precision = 10, scale = 2) private BigDecimal fat;
    @Column(precision = 10, scale = 2) private BigDecimal fiber;
    @Column(name = "iron_mg", precision = 10, scale = 2) private BigDecimal iron;
    @Column(name = "calcium_mg", precision = 10, scale = 2) private BigDecimal calcium;

    public NutritionLogItem() {}

    public NutritionLog getNutritionLog() { return nutritionLog; }
    public void setNutritionLog(NutritionLog nutritionLog) { this.nutritionLog = nutritionLog; }
    public void setFoodId(Long foodId) { this.foodId = foodId; }
    public void setFoodName(String foodName) { this.foodName = foodName; }
    public void setQuantityGrams(BigDecimal quantityGrams) { this.quantityGrams = quantityGrams; }
    public void setCalories(BigDecimal calories) { this.calories = calories; }
    public void setProtein(BigDecimal protein) { this.protein = protein; }
    public void setCarbs(BigDecimal carbs) { this.carbs = carbs; }
    public void setFat(BigDecimal fat) { this.fat = fat; }
    public void setFiber(BigDecimal fiber) { this.fiber = fiber; }
    public void setIron(BigDecimal iron) { this.iron = iron; }
    public void setCalcium(BigDecimal calcium) { this.calcium = calcium; }

    public Long getId() { return id; }
    public Long getFoodId() { return foodId; }
    public String getFoodName() { return foodName; }
    public BigDecimal getQuantityGrams() { return quantityGrams; }
    public BigDecimal getCalories() { return calories; }
    public BigDecimal getProtein() { return protein; }
    public BigDecimal getCarbs() { return carbs; }
    public BigDecimal getFat() { return fat; }
    public BigDecimal getFiber() { return fiber; }
    public BigDecimal getIron() { return iron; }
    public BigDecimal getCalcium() { return calcium; }
}
