package com.palette.palette.patterns.nullobject; // <-- Folder/Package ka naam badal gaya

// Humein purani StyleBundle class ko import karna parega kyunki woh factory folder mein hai
import java.util.ArrayList;

import com.palette.palette.patterns.factory.StyleBundle;

/**
 * Null Object implementation for StyleBundle.
 * Saved inside com.palette.palette.patterns.nullobject folder
 */
public class NoStyleBundle extends StyleBundle {

    public NoStyleBundle() {
        // Parent class (StyleBundle) ke constructor ko safe values bhej rahe hain
        super("NONE", "Standard Catalog Style - Safe default fallback.", "GENERIC", 1.0);
        setRecommendedProductIds(new ArrayList<>());
    }

    @Override
    public double getDiscountFactor() {
        return 1.0; // 0% discount
    }

    @Override
    public int getProductCount() {
        return 0; 
    }
}