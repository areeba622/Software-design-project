package com.palette.palette.patterns.builder;

import com.palette.palette.entities.CustomRoom;

import java.util.ArrayList;
import java.util.List;

/**
 * Builder class for constructing a {@link CustomRoom} step-by-step.
 *
 * <p>This class implements the <b>Builder Design Pattern</b> and maps directly to the
 * frontend room-wizard flow:</p>
 * <ul>
 *   <li><b>Step 1 (Constructor):</b> Provide mandatory fields — {@code roomType}, {@code width}, {@code length}</li>
 *   <li><b>Step 2 ({@link #setFlooring}):</b> Optionally add flooring material</li>
 *   <li><b>Step 3 ({@link #addFurniture}):</b> Add one or more furniture items (repeatable)</li>
 *   <li><b>Final ({@link #build}):</b> Validate all constraints, calculate total price, return a fully
 *       compiled {@link CustomRoom}</li>
 * </ul>
 *
 * <p><b>Price calculation example:</b></p>
 * <pre>
 *   RoomBuilder builder = new RoomBuilder("BEDROOM", 10, 12)
 *       .setFlooring("Hardwood")
 *       .addFurniture("King Bed")
 *       .addFurniture("Wardrobe")
 *       .addFurniture("Nightstand");
 *
 *   CustomRoom room = builder.build();
 *   // totalPrice = (10 × 12 × 500) + 15000 + (3 × 8000)
 *   //            = 60000 + 15000 + 24000
 *   //            = 99000 PKR
 * </pre>
 *
 * <p><b>Note:</b> This class has <em>no Spring dependencies</em>. It is a standalone pure-Java class.
 * It does NOT persist to the database — saving is the responsibility of the calling service.</p>
 */
public class RoomBuilder {

    // -------------------------------------------------------------------------
    // Pricing constants
    // -------------------------------------------------------------------------

    /** Price per square foot of room area, in PKR. */
    private static final double PRICE_PER_SQFT = 500.0;

    /** Fixed additional charge for any flooring upgrade, in PKR. */
    private static final double FLOORING_CHARGE = 15_000.0;

    /** Fixed charge per furniture item added to the room, in PKR. */
    private static final double FURNITURE_CHARGE = 8_000.0;

    // -------------------------------------------------------------------------
    // Immutable fields — set in constructor (Step 1)
    // -------------------------------------------------------------------------

    /** The type of room (e.g., BEDROOM, LIVING_ROOM, KITCHEN). Mandatory. */
    private final String roomType;

    /** The width of the room in feet. Must be > 0. Mandatory. */
    private final int width;

    /** The length of the room in feet. Must be > 0. Mandatory. */
    private final int length;

    // -------------------------------------------------------------------------
    // Mutable fields — set via fluent methods (Steps 2 & 3)
    // -------------------------------------------------------------------------

    /** The flooring material chosen by the user. Optional; defaults to {@code null}. */
    private String flooring = null;

    /** The list of furniture items added to the room. At least one required before {@link #build()}. */
    private List<String> furnitureItems = new ArrayList<>();

    /** The calculated total price in PKR. Computed during {@link #build()}. */
    private double totalPrice = 0.0;

    // -------------------------------------------------------------------------
    // Constructor — Step 1
    // -------------------------------------------------------------------------

    /**
     * Constructs a new {@code RoomBuilder} with the mandatory room parameters.
     * This represents <b>Step 1</b> of the room wizard.
     *
     * @param roomType the type of room (e.g., "BEDROOM", "LIVING_ROOM"); must not be null or blank
     * @param width    the width of the room in feet; must be greater than 0
     * @param length   the length of the room in feet; must be greater than 0
     * @throws IllegalArgumentException if {@code roomType} is null or blank,
     *                                  or if {@code width} or {@code length} is not positive
     */
    public RoomBuilder(String roomType, int width, int length) {
        if (roomType == null || roomType.isBlank()) {
            throw new IllegalArgumentException("Room type must not be null or blank");
        }
        if (width <= 0) {
            throw new IllegalArgumentException("Width must be greater than 0, but was: " + width);
        }
        if (length <= 0) {
            throw new IllegalArgumentException("Length must be greater than 0, but was: " + length);
        }

        this.roomType = roomType;
        this.width = width;
        this.length = length;
        this.furnitureItems = new ArrayList<>();
    }

    // -------------------------------------------------------------------------
    // Fluent setter — Step 2 (optional)
    // -------------------------------------------------------------------------

    /**
     * Sets the flooring material for the room.
     * This represents <b>Step 2</b> of the room wizard and is optional.
     * If not called, flooring will default to "Standard" when {@link #build()} is invoked.
     *
     * @param flooring the flooring material (e.g., "Hardwood", "Tile", "Carpet")
     * @return this {@code RoomBuilder} instance for fluent chaining
     */
    public RoomBuilder setFlooring(String flooring) {
        this.flooring = flooring;
        return this;
    }

    // -------------------------------------------------------------------------
    // Fluent adder — Step 3 (repeatable, at least 1 required)
    // -------------------------------------------------------------------------

    /**
     * Adds a furniture item to the room's furniture list.
     * This represents <b>Step 3</b> of the room wizard and may be called multiple times.
     * At least one item must be added before calling {@link #build()}.
     *
     * <p>Null or blank items are silently ignored to prevent data corruption.</p>
     *
     * @param item the name of the furniture item (e.g., "King Bed", "Wardrobe"); null/blank values are ignored
     * @return this {@code RoomBuilder} instance for fluent chaining
     */
    public RoomBuilder addFurniture(String item) {
        if (item != null && !item.isBlank()) {
            furnitureItems.add(item);
        }
        return this;
    }

    // -------------------------------------------------------------------------
    // Terminal method — build() compiles and validates the CustomRoom
    // -------------------------------------------------------------------------

    /**
     * Validates all accumulated room configuration, calculates the total price,
     * and constructs a fully compiled {@link CustomRoom} object.
     *
     * <p>This is the <b>terminal step</b> of the builder. The returned {@link CustomRoom}
     * is not yet persisted — the calling service is responsible for saving it.</p>
     *
     * <p><b>Validation performed:</b></p>
     * <ul>
     *   <li>At least one furniture item must have been added via {@link #addFurniture}</li>
     * </ul>
     *
     * <p><b>Price formula:</b></p>
     * <pre>
     *   baseCost  = width × length × PRICE_PER_SQFT  (500 PKR/sqft)
     *   floorCost = FLOORING_CHARGE if flooring is set, else 0  (15,000 PKR)
     *   furnCost  = furnitureItems.size() × FURNITURE_CHARGE    (8,000 PKR each)
     *   totalPrice = baseCost + floorCost + furnCost
     * </pre>
     *
     * @return a fully configured {@link CustomRoom} with calculated {@code totalPrice}
     * @throws IllegalStateException if no furniture items have been added
     */
    public CustomRoom build() {
        // --- Validate furniture requirement ---
        if (furnitureItems == null || furnitureItems.isEmpty()) {
            throw new IllegalStateException("At least 1 furniture item is required to build the room");
        }

        // --- Calculate total price ---
        double baseCost  = (double) width * length * PRICE_PER_SQFT;
        double floorCost = (flooring != null) ? FLOORING_CHARGE : 0.0;
        double furnCost  = furnitureItems.size() * FURNITURE_CHARGE;
        this.totalPrice  = baseCost + floorCost + furnCost;

        // --- Assemble the CustomRoom ---
        CustomRoom room = new CustomRoom();
        room.setRoomType(roomType);
        room.setWidth(width);
        room.setLength(length);
        room.setFlooring(flooring != null ? flooring : "Standard");
        room.setFurnitureItems(new ArrayList<>(furnitureItems));   // defensive copy
        room.setTotalPrice(totalPrice);

        return room;
    }

    // -------------------------------------------------------------------------
    // toString (for debugging purposes)
    // -------------------------------------------------------------------------

    /**
     * Returns a string representation of the current builder state.
     *
     * @return a debug-friendly string of the builder's current configuration
     */
    @Override
    public String toString() {
        return "RoomBuilder{" +
                "roomType='" + roomType + '\'' +
                ", width=" + width +
                ", length=" + length +
                ", flooring='" + flooring + '\'' +
                ", furnitureItems=" + furnitureItems +
                ", totalPrice=" + totalPrice +
                '}';
    }
}
