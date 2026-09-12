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
import jakarta.persistence.Table;

import com.palette.palette.patterns.composite.InventoryItem;

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
    // NEW CODE
    @Column(name = "width_ft", nullable = false)
    private Integer widthFt;
    // --
    @Column(nullable = false)
    private Integer length;
    // NEW CODE
    @Column(name = "length_ft", nullable = false)
    private Integer lengthFt;

    private String flooring;
    
    private String wallpaper;

    @ElementCollection
    @CollectionTable(name = "custom_room_furniture", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "furniture_item")
    private List<String> furnitureItems = new ArrayList<>();

    @Column(nullable = false)
    private Double totalPrice = 0.0;

    @Column(name = "total_price_inpkr", nullable = false)
    private Double totalPriceInPkr = 0.0;

    private LocalDateTime createdAt;

    // ── ADDED: maps the existing is_finalized NOT NULL column in the DB ──────
    @Column(name = "is_finalized", nullable = false)
    private Boolean isFinalized = false;
    // ─────────────────────────────────────────────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // ── Constructors ──────────────────────────────────────────────────────────
    public CustomRoom() {
    }

    public CustomRoom(String roomType, Integer width, Integer length) {
        this.roomType = roomType;
        // this.width = width;
        this.widthFt = width;
        // this.length = length;
        this.lengthFt = length;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
        this.widthFt = width;
    }

    public Integer getWidthFt() {
        return widthFt;
    }

    public void setWidthFt(Integer widthFt) {
        this.widthFt = widthFt;
    }

    public Integer getLength() {
        return length;
    }

    public void setLength(Integer length) {
        this.length = length;
        this.lengthFt = length;
    }

    public Integer getLengthFt() {
        return lengthFt;
    }

    public void setLengthFt(Integer lengthFt) {
        this.lengthFt = lengthFt;
    }

    public String getFlooring() {
        return flooring;
    }

    public void setFlooring(String flooring) {
        this.flooring = flooring;
    }

    public String getWallpaper() {
        return wallpaper;
    }

    public void setWallpaper(String wallpaper) {
        this.wallpaper = wallpaper;
    }

    public List<String> getFurnitureItems() {
        return furnitureItems;
    }

    public void setFurnitureItems(List<String> furnitureItems) {
        this.furnitureItems = furnitureItems;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
        this.totalPriceInPkr = totalPrice;
    }

    public Double getTotalPriceInPkr() {
        return totalPriceInPkr;
    }

    public void setTotalPriceInPkr(Double totalPriceInPkr) {
        this.totalPriceInPkr = totalPriceInPkr;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // ── InventoryItem Implementation ──────────────────────────────────────────
    @Override
    public String getName() {
        String baseName = (roomType != null ? roomType.replace("_", " ") : "Custom Room");
        // Capitalize nicely
        baseName = Arrays.stream(baseName.split(" "))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" ")) + " Bundle";
        
        String floorStr = (flooring != null && !flooring.equals("Standard")) ? " w/ " + flooring : "";
        String wallStr = (wallpaper != null && !wallpaper.isEmpty()) ? " & " + wallpaper : "";
        return baseName + floorStr + wallStr;
    }

    @Override
    public double getPrice() {
        return totalPrice != null ? totalPrice : 0.0;
    }


    // ── ADDED getter/setter for isFinalized ───────────────────────────────────
    public Boolean getIsFinalized() {
        return isFinalized;
    }

    public void setIsFinalized(Boolean isFinalized) {
        this.isFinalized = isFinalized;
    }
    // ─────────────────────────────────────────────────────────────────────────

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
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