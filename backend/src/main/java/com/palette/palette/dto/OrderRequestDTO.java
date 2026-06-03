package com.palette.palette.dto;

import jakarta.validation.constraints.NotNull;

public class OrderRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Cart ID is required")
    private Long cartId;

    public OrderRequestDTO() {}

    public OrderRequestDTO(Long userId, Long cartId) {
        this.userId = userId;
        this.cartId = cartId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCartId() { return cartId; }
    public void setCartId(Long cartId) { this.cartId = cartId; }

    @Override
    public String toString() {
        return "OrderRequestDTO{" +
                "userId=" + userId +
                ", cartId=" + cartId +
                '}';
    }
}