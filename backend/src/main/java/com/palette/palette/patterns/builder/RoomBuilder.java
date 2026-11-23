package com.palette.palette.patterns.builder;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import com.palette.palette.entities.CustomRoom;
import com.palette.palette.entities.Product;
import com.palette.palette.patterns.strategy.PricingStrategies;
import com.palette.palette.patterns.strategy.RoomDimensions;

/**
 * BUILDER PATTERN — assembles a {@link CustomRoom} step by step.
 *
 * <pre>
 * CustomRoom room = new RoomBuilder("LIVING_ROOM", 12, 15)   // required: type + size
 *         .withFlooring(hardwood)                            // optional
 *         .withWallpaper(botanical)                          // optional
 *         .addFurniture(sofa)                                // at least one
 *         .addFurniture(rug)
 *         .build();                                          // validates + prices
 * </pre>
 *
 * <p>{@link #build()} checks the room is complete and works out its price, using
 * a {@link com.palette.palette.patterns.strategy.PricingStrategy} per product
 * (Strategy pattern): flooring by floor area, wallpaper by wall area,
 * furniture per item. A room can never be created half-finished or with a
 * price that doesn't match its contents.</p>
 */
public class RoomBuilder {

    private final String roomType;
    private final RoomDimensions dimensions;

    private Product flooring;
    private Product wallpaper;
    private final List<Product> furniture = new ArrayList<>();

    /** Step 1 (required): room type and size in feet. */
    public RoomBuilder(String roomType, int width, int length) {
        if (roomType == null || roomType.isBlank()) {
            throw new IllegalArgumentException("Room type must not be blank");
        }
        this.roomType = roomType.trim().toUpperCase(Locale.ROOT);
        this.dimensions = new RoomDimensions(width, length);
    }

    /** Step 2 (optional): a FLOORING product. */
    public RoomBuilder withFlooring(Product product) {
        this.flooring = requireCategory(product, Product.ProductCategory.FLOORING, "flooring");
        return this;
    }

    /** Step 3 (optional): a WALLPAPER product. */
    public RoomBuilder withWallpaper(Product product) {
        this.wallpaper = requireCategory(product, Product.ProductCategory.WALLPAPER, "wallpaper");
        return this;
    }

    /** Step 4 (repeatable): a piece of furniture or decor. */
    public RoomBuilder addFurniture(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("Furniture must not be null");
        }
        furniture.add(product);
        return this;
    }

    /** Price so far, before {@link #build()}. */
    public double currentPrice() {
        double total = 0;
        for (Product product : allProducts()) {
            total += PricingStrategies.forProduct(product).price(product, dimensions);
        }
        return Math.round(total * 100) / 100.0;
    }

    /** Final step: validates the room and creates it with its total price. */
    public CustomRoom build() {
        if (furniture.isEmpty()) {
            throw new IllegalStateException("At least 1 furniture item is required to build the room");
        }

        CustomRoom room = new CustomRoom();
        room.setRoomType(roomType);
        room.setWidth(dimensions.width());
        room.setLength(dimensions.length());
        room.setFlooring(flooring != null ? flooring.getName() : "Standard");
        room.setWallpaper(wallpaper != null ? wallpaper.getName() : null);
        room.setFurnitureItems(furniture.stream().map(Product::getName).collect(java.util.stream.Collectors.toCollection(ArrayList::new)));
        room.setTotalPrice(currentPrice());
        room.setIsFinalized(false);
        return room;
    }

    private List<Product> allProducts() {
        List<Product> all = new ArrayList<>(furniture);
        if (flooring != null) all.add(flooring);
        if (wallpaper != null) all.add(wallpaper);
        return all;
    }

    private static Product requireCategory(Product product, Product.ProductCategory expected, String label) {
        if (product == null) {
            throw new IllegalArgumentException("The " + label + " product must not be null");
        }
        if (product.getCategory() != expected) {
            throw new IllegalArgumentException("Product " + product.getId() + " is not a " + label + " product.");
        }
        return product;
    }
}
