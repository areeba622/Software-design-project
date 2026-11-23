package com.palette.palette.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Add something to the cart. The price is never taken from the client —
 * the server looks it up from the item itself.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequestDTO {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 99, message = "Quantity cannot be more than 99")
    private Integer quantity;

    /** PRODUCT, BUNDLE or CUSTOM_ROOM. */
    @NotBlank(message = "Item type is required")
    private String itemType;
}
