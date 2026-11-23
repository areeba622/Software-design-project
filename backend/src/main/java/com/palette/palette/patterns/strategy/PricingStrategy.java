package com.palette.palette.patterns.strategy;

import com.palette.palette.entities.Product;

/**
 * STRATEGY PATTERN — how much a product costs once it is put into a room.
 *
 * <p>The same catalogue price means different things for different products:
 * a sofa costs its price, flooring costs its price per sq ft of floor, and
 * wallpaper costs its price per sq ft of wall. Each rule is its own strategy,
 * so the Room Builder never needs an if/else chain on the product category,
 * and a new rule (e.g. "per running foot of skirting") is just a new class.</p>
 *
 * <ul>
 *   <li>{@link PerItemPricing} — furniture and decor</li>
 *   <li>{@link FloorAreaPricing} — flooring</li>
 *   <li>{@link WallAreaPricing} — wallpaper</li>
 * </ul>
 *
 * {@link PricingStrategies#forProduct(Product)} picks the right one at runtime.
 */
public interface PricingStrategy {

    /** Price in PKR of {@code product} when used in a room of the given size. */
    double price(Product product, RoomDimensions room);

    /** Short human-readable label, e.g. "per sq ft of floor". */
    String describe();
}
