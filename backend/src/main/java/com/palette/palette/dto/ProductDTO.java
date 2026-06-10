package com.palette.palette.dto;

/**
 * ProductDTO - Data Transfer Object for Product
 * Used in quiz responses and product recommendations
 */
public class ProductDTO {
    private Long id;
    private String name;
    private String category;   // BED, CHAIR, RUG, etc.
    private String roomType;   // BEDROOM, LIVING_ROOM, etc.
    private Double priceInPKR;
    private String imageUrl;

    public ProductDTO() {
    }

    public ProductDTO(Long id, String name, String category, String roomType, Double priceInPKR, String imageUrl) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.roomType = roomType;
        this.priceInPKR = priceInPKR;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public Double getPriceInPKR() { return priceInPKR; }
    public void setPriceInPKR(Double priceInPKR) { this.priceInPKR = priceInPKR; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    @Override
    public String toString() {
        return "ProductDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", roomType='" + roomType + '\'' +
                ", priceInPKR=" + priceInPKR +
                '}';
    }
}
