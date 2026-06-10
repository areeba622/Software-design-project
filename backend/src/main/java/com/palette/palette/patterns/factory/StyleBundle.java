package com.palette.palette.patterns.factory;

import java.util.ArrayList;
import java.util.List;

/**
 * StyleBundle: Data carrier returned by AestheticBundleFactory
 * 
 * Contains:
 * - Style name and description
 * - Room type
 * - Recommended product IDs
 * - Discount factor
 */
public class StyleBundle {

    private String styleName;              // BOHOEMIAN, MINIMALIST
    private String styleDescription;       // Human-readable description
    private String roomType;               // BEDROOM, LIVING_ROOM, etc.
    private List<Long> recommendedProductIds = new ArrayList<>();
    private double discountFactor;         // e.g., 0.95 = 5% off

    // ── Constructors ──────────────────────────────────────────────────────────

    public StyleBundle() {
    }

    public StyleBundle(String styleName, String styleDescription, String roomType, 
                       double discountFactor) {
        this.styleName = styleName;
        this.styleDescription = styleDescription;
        this.roomType = roomType;
        this.discountFactor = discountFactor;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getStyleName() { return styleName; }
    public void setStyleName(String styleName) { this.styleName = styleName; }

    public String getStyleDescription() { return styleDescription; }
    public void setStyleDescription(String styleDescription) { 
        this.styleDescription = styleDescription; 
    }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public List<Long> getRecommendedProductIds() { return recommendedProductIds; }
    public void setRecommendedProductIds(List<Long> ids) { 
        this.recommendedProductIds = ids; 
    }

    public void addRecommendedProductId(Long productId) {
        this.recommendedProductIds.add(productId);
    }

    public double getDiscountFactor() { return discountFactor; }
    public void setDiscountFactor(double discountFactor) { 
        this.discountFactor = discountFactor; 
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    public int getProductCount() {
        return recommendedProductIds.size();
    }

    @Override
    public String toString() {
        return "StyleBundle{" +
                "styleName='" + styleName + '\'' +
                ", roomType='" + roomType + '\'' +
                ", productCount=" + recommendedProductIds.size() +
                ", discountFactor=" + discountFactor +
                '}';
    }
}