package com.palette.palette.patterns.composite;

/**
 * COMPOSITE PATTERN — the Component interface.
 *
 * <p>Anything that can go in the cart. Single products and groups of products
 * are treated the same way, so the cart and checkout price every line with one
 * call to {@link #getPrice()} and never ask what kind of item it is.</p>
 *
 * <ul>
 *   <li>Leaf: {@link com.palette.palette.entities.Product} — its own price</li>
 *   <li>Composite: {@link com.palette.palette.entities.FurnitureBundle} — sum of its
 *       products × the bundle discount</li>
 *   <li>Composite: {@link com.palette.palette.entities.CustomRoom} — flooring,
 *       wallpaper and furniture priced together by the Room Builder</li>
 * </ul>
 *
 * Client: {@link com.palette.palette.services.CartManager#priceLines}.
 */
public interface InventoryItem {

    Long getId();

    String getName();

    /** Price in PKR of one unit of this item. */
    double getPrice();
}
