package com.nurture.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notification_tokens",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = "token"
                )
        }
)
public class NotificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // USER ID
    // =====================================================

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // =====================================================
    // FCM TOKEN
    // =====================================================

    @Column(name = "token", nullable = false, length = 500)
    private String token;

    // =====================================================
    // ACTIVE
    // =====================================================

    @Column(nullable = false)
    private boolean active = true;

    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // =====================================================
    // UPDATED AT
    // =====================================================

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public NotificationToken() {
    }

    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    // =====================================================
    // PRE UPDATE
    // =====================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    // =====================================================
    // ID
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // =====================================================
    // USER ID
    // =====================================================

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // =====================================================
    // TOKEN
    // =====================================================

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    // =====================================================
    // ACTIVE
    // =====================================================

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    // =====================================================
    // CREATED AT
    // =====================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // =====================================================
    // UPDATED AT
    // =====================================================

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}