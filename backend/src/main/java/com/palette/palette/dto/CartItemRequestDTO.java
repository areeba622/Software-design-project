package com.palette.palette.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemRequestDTO {

    @NotNull(message = "Item ID must not be null")
    private Long itemId;

    @NotNull(message = "Quantity must not be null")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    // Accepted values: "PRODUCT" or "BUNDLE"
    @NotNull(message = "Item type must not be null")
    private String itemType;
}