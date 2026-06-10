package com.palette.palette.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DesignQuizRequestDTO
 * 
 * Receives: Quiz result from frontend
 * 
 * Example:
 * {
 *   "style": "BOHEMIAN",
 *   "roomType": "BEDROOM"
 * }
 */
public class DesignQuizRequestDTO {

    @NotBlank(message = "Style is required")
    private String style;              

    @NotBlank(message = "Room type is required")
    private String roomType;           // BEDROOM, LIVING_ROOM, KITCHEN, etc.

    // ── Constructors ──────────────────────────────────────────────────────────

    public DesignQuizRequestDTO() {
    }

    public DesignQuizRequestDTO(String style, String roomType) {
        this.style = style;
        this.roomType = roomType;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    @Override
    public String toString() {
        return "DesignQuizRequestDTO{" +
                "style='" + style + '\'' +
                ", roomType='" + roomType + '\'' +
                '}';
    }
}