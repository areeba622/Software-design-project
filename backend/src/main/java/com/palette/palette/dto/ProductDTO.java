package com.palette.palette.dto;

import com.palette.palette.entities.Product;

/** A product as the API returns it. Build one with {@link #from(Product)}. */
public record ProductDTO(
        Long id,
        String name,
        String description,
        Double priceInPKR,
        String imageUrl,
        String category,
        String roomType,
        String aestheticStyle,
        String vendorName) {

    public static ProductDTO from(Product product) {
        return new ProductDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPriceInPKR(),
                product.getImageUrl(),
                product.getCategory() != null ? product.getCategory().name() : null,
                product.getRoomType() != null ? product.getRoomType().name() : null,
                product.getAestheticStyle() != null ? product.getAestheticStyle().name() : null,
                product.getVendorName());
    }
}
