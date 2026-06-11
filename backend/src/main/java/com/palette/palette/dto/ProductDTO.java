// src/main/java/com/palette/palette/dto/ProductDTO.java

package com.palette.palette.dto;

/**
 * DTO for product responses in room builder.
 */
public class ProductDTO {

    private Long id;
    private String name;
    private String description;
    private Double priceInPKR;
    private String imageUrl;
    private String category;
    private String roomType;
    private String aestheticStyle;

    // ── Constructors ──────────────────────────────────────────────────────────
    public ProductDTO() {}

    public ProductDTO(Long id, String name, Double priceInPKR, String category, 
                      String roomType, String aestheticStyle) {
        this.id = id;
        this.name = name;
        this.priceInPKR = priceInPKR;
        this.category = category;
        this.roomType = roomType;
        this.aestheticStyle = aestheticStyle;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPriceInPKR() { return priceInPKR; }
    public void setPriceInPKR(Double priceInPKR) { this.priceInPKR = priceInPKR; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getAestheticStyle() { return aestheticStyle; }
    public void setAestheticStyle(String aestheticStyle) { this.aestheticStyle = aestheticStyle; }

    @Override
    public String toString() {
        return "ProductDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", priceInPKR=" + priceInPKR +
                ", aestheticStyle='" + aestheticStyle + '\'' +
                '}';
    }
}