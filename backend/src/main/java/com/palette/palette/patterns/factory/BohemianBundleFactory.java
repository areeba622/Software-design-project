package com.palette.palette.patterns.factory;

import java.util.List;
import java.util.Map;

/** Concrete creator for Bohemian bundles — 5% off. Ids refer to V2__seed_catalog.sql. */
public final class BohemianBundleFactory extends StyleBundleFactory {

    private static final Map<String, List<Long>> CURATED = Map.of(
            // canopy bed, macrame bed, swing chair, tassel lamp, rattan wardrobe, geometric wallpaper
            "BEDROOM", List.of(90L, 91L, 97L, 99L, 83L, 116L),
            // rattan sofa, accent chair, round coffee table, basket pendant, medallion rug, botanical wallpaper
            "LIVING_ROOM", List.of(106L, 96L, 94L, 98L, 101L, 115L),
            // rattan basket, rustic table, seagrass pendant
            "KITCHEN", List.of(120L, 121L, 122L),
            // organic dining table
            "DINING_ROOM", List.of(95L));

    @Override
    public String styleName() {
        return "BOHEMIAN";
    }

    @Override
    public String styleDescription() {
        return "Free-spirited, eclectic, artistic, nature-inspired with vibrant colors and mixed textures";
    }

    @Override
    public double discountFactor() {
        return 0.95;
    }

    @Override
    protected Map<String, List<Long>> curatedProducts() {
        return CURATED;
    }
}
