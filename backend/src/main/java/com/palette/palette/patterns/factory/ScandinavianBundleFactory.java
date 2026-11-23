package com.palette.palette.patterns.factory;

import java.util.List;
import java.util.Map;

/** Concrete creator for Scandinavian bundles — 8% off. Ids refer to V2__seed_catalog.sql. */
public final class ScandinavianBundleFactory extends StyleBundleFactory {

    private static final Map<String, List<Long>> CURATED = Map.of(
            // light oak bed, scandi bed, paper lantern, ceramic lamp, oak wardrobe, slatted wardrobe
            "BEDROOM", List.of(31L, 32L, 56L, 58L, 65L, 66L),
            // lounge chair, armchair, tripod lamp, arching floor lamp, wool rug, glass tray
            "LIVING_ROOM", List.of(47L, 50L, 53L, 57L, 60L, 41L),
            // spoon set, salad bowl, mug set, serving tray, counter stool, wooden pendant
            "KITCHEN", List.of(42L, 43L, 45L, 46L, 52L, 59L),
            // dining chair, spindle chair, pleated pendant
            "DINING_ROOM", List.of(48L, 51L, 54L));

    @Override
    public String styleName() {
        return "SCANDINAVIAN";
    }

    @Override
    public String styleDescription() {
        return "Light, airy, functional design with natural materials, cozy warmth, and minimalist sophistication";
    }

    @Override
    public double discountFactor() {
        return 0.92;
    }

    @Override
    protected Map<String, List<Long>> curatedProducts() {
        return CURATED;
    }
}
