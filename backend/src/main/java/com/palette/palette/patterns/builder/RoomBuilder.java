package com.palette.palette.patterns.builder;

import java.util.ArrayList;
import java.util.List;

import com.palette.palette.entities.CustomRoom;

public class RoomBuilder {

    private final String roomType;
    private final int    width;
    private final int    length;

    private String       flooring      = null;
    private String       wallpaper     = null;
    private List<String> furnitureItems = new ArrayList<>();
    private double       totalPrice    = 0.0;

    // ── Constructor — Step 1 ──────────────────────────────────────────────────
    public RoomBuilder(String roomType, int width, int length) {
        if (roomType == null || roomType.isBlank())
            throw new IllegalArgumentException("Room type must not be null or blank");
        if (width  <= 0) throw new IllegalArgumentException("Width must be greater than 0, but was: "  + width);
        if (length <= 0) throw new IllegalArgumentException("Length must be greater than 0, but was: " + length);

        this.roomType = roomType;
        this.width    = width;
        this.length   = length;
        this.furnitureItems = new ArrayList<>();
    }

    // ── Step 2 — optional flooring ────────────────────────────────────────────
    public RoomBuilder setFlooring(String flooring) {
        this.flooring = flooring;
        return this;
    }

    // ── Step 3 — optional wallpaper ───────────────────────────────────────────
    public RoomBuilder setWallpaper(String wallpaper) {
        this.wallpaper = wallpaper;
        return this;
    }

    // ── Step 4 — add furniture (repeatable) ───────────────────────────────────
    public RoomBuilder addFurniture(String item) {
        if (item != null && !item.isBlank()) {
            furnitureItems.add(item);
        }
        return this;
    }

    // ── External Pricing ──────────────────────────────────────────────────────
    public RoomBuilder setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
        return this;
    }

    // ── Terminal: build() ─────────────────────────────────────────────────────
    public CustomRoom build() {
        if (furnitureItems == null || furnitureItems.isEmpty())
            throw new IllegalStateException("At least 1 furniture item is required to build the room");

        CustomRoom room = new CustomRoom();
        room.setRoomType(roomType);
        room.setWidth(width);
        room.setLength(length);
        room.setFlooring(flooring != null ? flooring : "Standard");
        room.setWallpaper(wallpaper);
        room.setFurnitureItems(new ArrayList<>(furnitureItems));
        room.setTotalPrice(totalPrice);

        // ── ADDED: satisfies the NOT NULL constraint in the DB ────────────────
        room.setIsFinalized(false);
        // ─────────────────────────────────────────────────────────────────────

        return room;
    }

    @Override
    public String toString() {
        return "RoomBuilder{" +
                "roomType='" + roomType + '\'' +
                ", width=" + width +
                ", length=" + length +
                ", flooring='" + flooring + '\'' +
                ", wallpaper='" + wallpaper + '\'' +
                ", furnitureItems=" + furnitureItems +
                ", totalPrice=" + totalPrice +
                '}';
    }
}