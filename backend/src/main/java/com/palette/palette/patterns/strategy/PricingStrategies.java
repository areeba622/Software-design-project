package com.palette.palette.patterns.strategy;

import com.palette.palette.entities.Product;

/**
 * Chooses the {@link PricingStrategy} for a product. The strategies hold no
 * state, so one shared instance of each is enough.
 */
public final class PricingStrategies {

    public static final PricingStrategy PER_ITEM = new PerItemPricing();
    public static final PricingStrategy FLOOR_AREA = new FloorAreaPricing();
    public static final PricingStrategy WALL_AREA = new WallAreaPricing();

    private PricingStrategies() {
    }

    public static PricingStrategy forProduct(Product product) {
        Product.ProductCategory category = product.getCategory();
        if (category == null) {
            return PER_ITEM;
        }
        return switch (category) {
            case FLOORING -> FLOOR_AREA;
            case WALLPAPER -> WALL_AREA;
            default -> PER_ITEM;
        };
    }
}
