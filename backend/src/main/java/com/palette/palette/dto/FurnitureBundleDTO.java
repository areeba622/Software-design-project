package com.palette.palette.dto;

import java.util.List;

import com.palette.palette.entities.FurnitureBundle;

/** A furniture bundle with its products and its discounted (composite) price. */
public record FurnitureBundleDTO(
        Long id,
        String name,
        String description,
        String roomType,
        String style,
        Double discountFactor,
        double priceInPKR,
        List<ProductDTO> products) {

    public static FurnitureBundleDTO from(FurnitureBundle bundle) {
        return new FurnitureBundleDTO(
                bundle.getId(),
                bundle.getName(),
                bundle.getDescription(),
                bundle.getRoomType() != null ? bundle.getRoomType().name() : null,
                bundle.getStyle() != null ? bundle.getStyle().getName() : null,
                bundle.getDiscountFactor(),
                bundle.getPrice(),
                bundle.getProducts().stream().map(ProductDTO::from).toList());
    }
}
