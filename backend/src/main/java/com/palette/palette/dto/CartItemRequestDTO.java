package com.palette.palette.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CartItemRequestDTO {

    @NotNull(message = "Item ID must not be null")
    private Long itemId;

    @NotNull(message = "Quantity must not be null")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    // Accepted values: "PRODUCT" or "BUNDLE"
    @NotNull(message = "Item type must not be null")
    private String itemType;

    private Double unitPrice;

    public CartItemRequestDTO() {}

    public CartItemRequestDTO(Long itemId, Integer quantity, String itemType, Double unitPrice) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.itemType = itemType;
        this.unitPrice = unitPrice;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }
}