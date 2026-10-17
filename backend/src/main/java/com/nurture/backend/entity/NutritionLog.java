package com.nurture.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nutrition_logs", indexes = {
        @Index(name = "idx_nutrition_user_date", columnList = "user_id, log_date")
})
public class NutritionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "meal_type", nullable = false, length = 30)
    private String mealType;

    @Column(length = 1000)
    private String notes;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "nutritionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NutritionLogItem> items = new ArrayList<>();

    public NutritionLog() {}

    @PrePersist
    public void beforeInsert() {
        ZoneId india = ZoneId.of("Asia/Kolkata");
        if (createdAt == null) createdAt = LocalDateTime.now(india);
        if (logDate == null) logDate = LocalDate.now(india);
    }

    public void addItem(NutritionLogItem item) {
        items.add(item);
        item.setNutritionLog(this);
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getMealType() { return mealType; }
    public void setMealType(String mealType) { this.mealType = mealType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDate getLogDate() { return logDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<NutritionLogItem> getItems() { return items; }
}
