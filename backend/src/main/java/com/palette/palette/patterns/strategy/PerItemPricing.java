package com.palette.palette.patterns.strategy;

import com.palette.palette.entities.Product;

/** Concrete strategy: a piece of furniture costs its price, whatever the room size. */
public final class PerItemPricing implements PricingStrategy {

    @Override
    public double price(Product product, RoomDimensions room) {
        return product.getPrice();
    }

    @Override
    public String describe() {
        return "per item";
    }
}
