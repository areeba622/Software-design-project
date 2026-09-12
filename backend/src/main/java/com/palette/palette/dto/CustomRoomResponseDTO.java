// src/main/java/com/palette/palette/dto/CustomRoomResponseDTO.java

package com.palette.palette.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for custom room operations.
 * 
 * Sent back to frontend after building/retrieving a room.
 */
public class CustomRoomResponseDTO {

    private Long roomId;
    private Long userId;
    private String roomType;
    private Integer width;
    private Integer length;
    private String flooring;
    private String wallpaper;
    private List<String> furnitureItems;
    private Double totalPrice;
    private LocalDateTime createdAt;

    // ── Constructors ──────────────────────────────────────────────────────────
    public CustomRoomResponseDTO() {}

    public CustomRoomResponseDTO(Long roomId, String roomType, Integer width, 
                                Integer length, String flooring, String wallpaper, 
                                List<String> furnitureItems, Double totalPrice) {
        this.roomId = roomId;
        this.roomType = roomType;
        this.width = width;
        this.length = length;
        this.flooring = flooring;
        this.wallpaper = wallpaper;
        this.furnitureItems = furnitureItems;
        this.totalPrice = totalPrice;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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

    @Override
    public String toString() {
        return "CustomRoomResponseDTO{" +
                "roomId=" + roomId +
                ", roomType='" + roomType + '\'' +
                ", dimensions=" + width + "x" + length +
                ", totalPrice=" + totalPrice +
                '}';
    }
}