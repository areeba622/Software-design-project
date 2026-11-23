package com.palette.palette.patterns.factory;

import java.util.List;
import java.util.Map;

/** Concrete creator for Minimalist bundles — no discount. Ids refer to V2__seed_catalog.sql. */
public final class MinimalistBundleFactory extends StyleBundleFactory {

    private static final Map<String, List<Long>> CURATED = Map.of(
            // platform bed, oak bed frame, fabric bed, geometric shelf, hexagon shelves, cozy armchair
            "BEDROOM", List.of(1L, 2L, 4L, 7L, 10L, 24L),
            // 3-seater sofa, lounge chair, patio chair, corner chair, floating shelf, corner shelf
            "LIVING_ROOM", List.of(29L, 20L, 23L, 26L, 6L, 9L),
            // cabinet set, island table, counter stool, pendant lamp, spice rack, bar stool
            "KITCHEN", List.of(11L, 12L, 13L, 14L, 15L, 25L),
            // dining chair, dining table set, dinnerware, mug rack
            "DINING_ROOM", List.of(22L, 16L, 17L, 18L));

    @Override
    public String styleName() {
        return "MINIMALIST";
    }

    @Override
    public String styleDescription() {
        return "Clean lines, essential design, uncluttered spaces with focus on function and form";
    }

    @Override
    public double discountFactor() {
        return 1.0;
    }

    @Override
    protected Map<String, List<Long>> curatedProducts() {
        return CURATED;
    }
}
