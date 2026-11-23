package com.palette.palette.patterns.strategy;

import com.palette.palette.entities.Product;

/** Concrete strategy: wallpaper is priced per square foot of wall. */
public final class WallAreaPricing implements PricingStrategy {

    @Override
    public double price(Product product, RoomDimensions room) {
        return product.getPrice() * room.wallArea();
    }

    @Override
    public String describe() {
        return "per sq ft of wall";
    }
}
