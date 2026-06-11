package com.palette.palette.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "custom_rooms")
public class CustomRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String roomType;  // e.g., "Bedroom", "Game Room"

    @Column(nullable = false)
    private Integer width;    // in feet

    @Column(nullable = false)
    private Integer length;   // in feet

    private String flooring;  // e.g., "Hardwood", "Tiles"

    @ElementCollection
    @CollectionTable(name = "custom_room_furniture", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "furniture_item")
    private List<String> furnitureItems = new ArrayList<>();

    @Column(nullable = false)
    private Double totalPrice = 0.0;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // ── Constructors ──────────────────────────────────────────────────────────
    public CustomRoom() {}

    public CustomRoom(String roomType, Integer width, Integer length) {
        this.roomType = roomType;
        this.width = width;
        this.length = length;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }

    public Integer getLength() { return length; }
    public void setLength(Integer length) { this.length = length; }

    public String getFlooring() { return flooring; }
    public void setFlooring(String flooring) { this.flooring = flooring; }

    public List<String> getFurnitureItems() { return furnitureItems; }
    public void setFurnitureItems(List<String> furnitureItems) { this.furnitureItems = furnitureItems; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // ── equals & hashCode ─────────────────────────────────────────────────────
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CustomRoom that = (CustomRoom) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "CustomRoom{" +
                "id=" + id +
                ", roomType='" + roomType + '\'' +
                ", dimensions=" + width + "x" + length +
                ", totalPrice=" + totalPrice +
                '}';
    }
}