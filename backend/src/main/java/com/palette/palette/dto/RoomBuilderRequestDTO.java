// src/main/java/com/palette/palette/dto/RoomBuilderRequestDTO.java

package com.palette.palette.dto;

import jakarta.validation.constraints.*;
import java.util.List;

/**
 * Request DTO for building a custom room.
 * 
 * Contains user input from the room builder wizard:
 * - Step 1: roomType, width, length (mandatory)
 * - Step 2: flooring (optional)
 * - Step 3: furnitureItems (list of product names/IDs selected)
 */
public class RoomBuilderRequestDTO {

    @NotBlank(message = "Room type is required")
    private String roomType;  // e.g., "BEDROOM", "LIVING_ROOM"

    @NotNull(message = "Width is required")
    @Min(value = 1, message = "Width must be at least 1 foot")
    @Max(value = 100, message = "Width cannot exceed 100 feet")
    private Integer width;

    @NotNull(message = "Length is required")
    @Min(value = 1, message = "Length must be at least 1 foot")
    @Max(value = 100, message = "Length cannot exceed 100 feet")
    private Integer length;

    private String flooring;  // Optional: e.g., "Hardwood", "Tile"

    @NotEmpty(message = "At least one furniture item is required")
    private List<String> furnitureItems;  // e.g., ["Bed", "Wardrobe", "Nightstand"]

    // ── Constructors ──────────────────────────────────────────────────────────
    public RoomBuilderRequestDTO() {}

    public RoomBuilderRequestDTO(String roomType, Integer width, Integer length, 
                                 String flooring, List<String> furnitureItems) {
        this.roomType = roomType;
        this.width = width;
        this.length = length;
        this.flooring = flooring;
        this.furnitureItems = furnitureItems;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
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

    @Override
    public String toString() {
        return "RoomBuilderRequestDTO{" +
                "roomType='" + roomType + '\'' +
                ", dimensions=" + width + "x" + length +
                ", flooring='" + flooring + '\'' +
                ", furnitureCount=" + (furnitureItems != null ? furnitureItems.size() : 0) +
                '}';
    }
}