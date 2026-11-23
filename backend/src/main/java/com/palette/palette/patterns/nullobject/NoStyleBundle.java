package com.palette.palette.patterns.nullobject;

import java.util.List;

import com.palette.palette.patterns.factory.StyleBundle;

/**
 * NULL OBJECT PATTERN — the "no recommendation" bundle.
 *
 * <p>Returned by the bundle factories instead of {@code null} when a style or
 * room isn't known. It behaves like a normal, harmless bundle: no products, no
 * discount, a neutral name. Callers use it exactly like a real bundle and never
 * need a null check; the only thing they may ask is {@link #isAvailable()}.</p>
 */
public final class NoStyleBundle extends StyleBundle {

    public NoStyleBundle() {
        super("NONE", "Standard catalogue — no curated set for this choice yet.", "GENERIC", 1.0);
    }

    /** Always empty, and cannot be filled. */
    @Override
    public List<Long> getRecommendedProductIds() {
        return List.of();
    }

    @Override
    public void addRecommendedProductId(Long productId) {
        // a null object stays empty
    }

    @Override
    public boolean isAvailable() {
        return false;
    }
}
