package com.palette.palette.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Pay for an order. There is deliberately no amount field: the server always
 * charges the order's own total, so the browser can't change the price.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    /** STRIPE or JAZZCASH. */
    @NotBlank(message = "Choose a payment method")
    private String gatewayType;
}
