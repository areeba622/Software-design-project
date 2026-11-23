package com.palette.palette.patterns.factory;

import java.util.ArrayList;
import java.util.List;

/**
 * The product made by the {@link StyleBundleFactory} factory method: a curated
 * set of products for one style and room, with the style's bundle discount.
 */
public class StyleBundle {

    private final String styleName;
    private final String styleDescription;
    private final String roomType;
    private final double discountFactor;
    private final List<Long> recommendedProductIds = new ArrayList<>();

    public StyleBundle(String styleName, String styleDescription, String roomType, double discountFactor) {
        this.styleName = styleName;
        this.styleDescription = styleDescription;
        this.roomType = roomType;
        this.discountFactor = discountFactor;
    }

    public String getStyleName() { return styleName; }

    public String getStyleDescription() { return styleDescription; }

    public String getRoomType() { return roomType; }

    /** Price multiplier for the whole bundle, e.g. 0.95 = 5% off. */
    public double getDiscountFactor() { return discountFactor; }

    public List<Long> getRecommendedProductIds() { return recommendedProductIds; }

    public void addRecommendedProductId(Long productId) {
        recommendedProductIds.add(productId);
    }

    public int getProductCount() {
        return recommendedProductIds.size();
    }

    /** True for a real recommendation; the {@code NoStyleBundle} null object returns false. */
    public boolean isAvailable() {
        return true;
    }

    @Override
    public String toString() {
        return "StyleBundle{styleName='" + styleName + "', roomType='" + roomType
                + "', productCount=" + getProductCount() + ", discountFactor=" + discountFactor + "}";
    }
}
