package com.palette.palette.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "design_quizzes")
public class DesignQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String selectedStyle;       // BOHO, MINIMALIST, DESI

    @Column(nullable = false)
    private String selectedRoomType;    // BEDROOM, LIVING_ROOM, etc.

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public DesignQuiz() {
    }

    public DesignQuiz(User user, String selectedStyle, String selectedRoomType) {
        this.user = user;
        this.selectedStyle = selectedStyle;
        this.selectedRoomType = selectedRoomType;
        this.createdAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSelectedStyle() { return selectedStyle; }
    public void setSelectedStyle(String selectedStyle) { this.selectedStyle = selectedStyle; }

    public String getSelectedRoomType() { return selectedRoomType; }
    public void setSelectedRoomType(String selectedRoomType) { 
        this.selectedRoomType = selectedRoomType; 
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "DesignQuiz{" +
                "id=" + id +
                ", style='" + selectedStyle + '\'' +
                ", roomType='" + selectedRoomType + '\'' +
                '}';
    }
}