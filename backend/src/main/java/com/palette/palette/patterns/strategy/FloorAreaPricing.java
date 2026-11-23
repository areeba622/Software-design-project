package com.palette.palette.patterns.strategy;

import com.palette.palette.entities.Product;

/** Concrete strategy: flooring is priced per square foot of floor. */
public final class FloorAreaPricing implements PricingStrategy {

    @Override
    public double price(Product product, RoomDimensions room) {
        return product.getPrice() * room.floorArea();
    }

    @Override
    public String describe() {
        return "per sq ft of floor";
    }
}
