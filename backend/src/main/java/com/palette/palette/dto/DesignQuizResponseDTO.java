package com.palette.palette.dto;

import java.util.ArrayList;
import java.util.List;

public class DesignQuizResponseDTO {

    private String aestheticStyle;      // "BOHEMIAN", "MINIMALIST", "SCANDINAVIAN"
    private String roomType;            // "BEDROOM", "LIVING_ROOM", etc.
    private String recommendationTitle; // e.g., "BOHO BEDROOM"
    private String message;             // e.g., "Perfect BohEMIAN Bedroom setup!"

    private BundleDTO recommendedBundle; // The curated furniture bundle
    private List<ProductDTO> bundleProducts; // Filtered products for this room

    // ── Nested DTOs ───────────────────────────────────────────────────────────

    public static class BundleDTO {
        private Long id;
        private String name;
        private String description;
        private Double discountFactor;
        private Double totalPrice;

        public BundleDTO() {
        }

        public BundleDTO(Long id, String name, String description, Double discountFactor, Double totalPrice) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.discountFactor = discountFactor;
            this.totalPrice = totalPrice;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Double getDiscountFactor() { return discountFactor; }
        public void setDiscountFactor(Double discountFactor) { this.discountFactor = discountFactor; }

        public Double getTotalPrice() { return totalPrice; }
        public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

        @Override
        public String toString() {
            return "BundleDTO{" +
                    "id=" + id +
                    ", name='" + name + '\'' +
                    ", totalPrice=" + totalPrice +
                    '}';
        }
    }



    // ── Main Class Constructors & Getters/Setters ──────────────────────────

    public DesignQuizResponseDTO() {
        this.bundleProducts = new ArrayList<>();
    }

    public DesignQuizResponseDTO(String aestheticStyle, String roomType, String recommendationTitle,
                                  String message, BundleDTO recommendedBundle, List<ProductDTO> bundleProducts) {
        this.aestheticStyle = aestheticStyle;
        this.roomType = roomType;
        this.recommendationTitle = recommendationTitle;
        this.message = message;
        this.recommendedBundle = recommendedBundle;
        this.bundleProducts = bundleProducts;
    }

    public String getAestheticStyle() { return aestheticStyle; }
    public void setAestheticStyle(String aestheticStyle) { this.aestheticStyle = aestheticStyle; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getRecommendationTitle() { return recommendationTitle; }
    public void setRecommendationTitle(String recommendationTitle) { this.recommendationTitle = recommendationTitle; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public BundleDTO getRecommendedBundle() { return recommendedBundle; }
    public void setRecommendedBundle(BundleDTO recommendedBundle) { this.recommendedBundle = recommendedBundle; }

    public List<ProductDTO> getBundleProducts() { return bundleProducts; }
    public void setBundleProducts(List<ProductDTO> bundleProducts) { this.bundleProducts = bundleProducts; }

    @Override
    public String toString() {
        return "DesignQuizResponseDTO{" +
                "aestheticStyle='" + aestheticStyle + '\'' +
                ", roomType='" + roomType + '\'' +
                ", recommendationTitle='" + recommendationTitle + '\'' +
                ", productCount=" + (bundleProducts != null ? bundleProducts.size() : 0) +
                '}';
    }
}