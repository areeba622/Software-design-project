package com.palette.palette.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import com.palette.palette.patterns.composite.InventoryItem;

/**
 * A room designed by a user in the Room Builder (built via
 * {@link com.palette.palette.patterns.builder.RoomBuilder}).
 * Acts as a composite {@link InventoryItem} so it can sit in the cart next to
 * products and bundles. Width and length are in feet.
 */
@Entity
@Table(name = "custom_rooms")
public class CustomRoom implements InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String roomType;

    @Column(nullable = false)
    private Integer width;

    @Column(nullable = false)
    private Integer length;

    private String flooring;

    private String wallpaper;

    @ElementCollection
    @CollectionTable(name = "custom_room_furniture", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "furniture_item")
    private List<String> furnitureItems = new ArrayList<>();

    @Column(name = "total_price_pkr", nullable = false)
    private Double totalPrice = 0.0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean isFinalized = false;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public CustomRoom() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // ── InventoryItem ────────────────────────────────────────────────────────

    @Override
    public Long getId() { return id; }

    /** e.g. "Living Room Bundle w/ Warm Hardwood & Botanical Wallpaper". */
    @Override
    public String getName() {
        String base = roomType != null ? roomType.replace("_", " ") : "Custom Room";
        base = Arrays.stream(base.trim().split("\\s+"))
                .filter(word -> !word.isEmpty())
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" ")) + " Bundle";
        String floorPart = (flooring != null && !flooring.equals("Standard")) ? " w/ " + flooring : "";
        String wallPart = (wallpaper != null && !wallpaper.isBlank()) ? " & " + wallpaper : "";
        return base + floorPart + wallPart;
    }

    @Override
    public double getPrice() {
        return totalPrice != null ? totalPrice : 0.0;
    }

    // ── Getters / setters ────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }

    public Integer getLength() { return length; }
    public void setLength(Integer length) { this.length = length; }

    public String getFlooring() { return flooring; }
    public void setFlooring(String flooring) { this.flooring = flooring; }

    public String getWallpaper() { return wallpaper; }
    public void setWallpaper(String wallpaper) { this.wallpaper = wallpaper; }

    public List<String> getFurnitureItems() { return furnitureItems; }
    public void setFurnitureItems(List<String> furnitureItems) { this.furnitureItems = furnitureItems; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getIsFinalized() { return isFinalized; }
    public void setIsFinalized(Boolean isFinalized) { this.isFinalized = isFinalized; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CustomRoom that = (CustomRoom) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "CustomRoom{id=" + id + ", roomType='" + roomType + "', dimensions="
                + width + "x" + length + ", totalPrice=" + totalPrice + "}";
    }
}
