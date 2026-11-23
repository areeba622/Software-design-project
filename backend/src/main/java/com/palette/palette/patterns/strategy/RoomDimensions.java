package com.palette.palette.patterns.strategy;

/**
 * Size of a room in feet, plus the two areas the pricing strategies need.
 *
 * @param width  room width in feet (1–100)
 * @param length room length in feet (1–100)
 */
public record RoomDimensions(int width, int length) {

    /** Standard ceiling height used for wall area. */
    public static final int WALL_HEIGHT_FT = 10;

    public RoomDimensions {
        if (width <= 0) throw new IllegalArgumentException("Width must be greater than 0, but was: " + width);
        if (length <= 0) throw new IllegalArgumentException("Length must be greater than 0, but was: " + length);
    }

    /** Floor area in square feet: width × length. */
    public int floorArea() {
        return width * length;
    }

    /** Area of the four walls in square feet: perimeter × ceiling height. */
    public int wallArea() {
        return 2 * (width + length) * WALL_HEIGHT_FT;
    }
}
