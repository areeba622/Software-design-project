package com.palette.palette.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PaymentRequestDTO {

    @NotNull(message = "Order ID must not be null")
    private Long orderId;

    @NotNull(message = "Gateway type must not be null")
    private String gatewayType;  // "STRIPE" or "JAZZCASH" or "ALFABANK"

    @NotNull(message = "Amount in PKR must not be null")
    @Min(value = 1, message = "Amount must be at least 1 PKR")
    private Double amountInPKR;

    private Long paymentId;
    private String status;
    private Double amountInUSD;
    private String transactionId;
    private LocalDateTime createdAt;
    private String message;            // Needed for success/failure feedback strings

    // Constructors
    public PaymentRequestDTO() {
    }

    public PaymentRequestDTO(Long orderId, String gatewayType, Double amountInPKR) {
        this.orderId = orderId;
        this.gatewayType = gatewayType;
        this.amountInPKR = amountInPKR;
    }

    // Getters
    public Long getOrderId() {
        return orderId;
    }

    public String getGatewayType() {
        return gatewayType;
    }

    public Double getAmountInPKR() {
        return amountInPKR;
    }

    public Long getPaymentId() { return paymentId; }
    //public String getGateway() { return gateway; }
    public String getStatus() { return status; }
    public Double getAmountInUSD() { return amountInUSD; }
    public String getTransactionId() { return transactionId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getMessage() { return message; }



    // Setters
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public void setGatewayType(String gatewayType) {
        this.gatewayType = gatewayType;
    }

    public void setAmountInPKR(Double amountInPKR) {
        this.amountInPKR = amountInPKR;
    }

    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public void setStatus(String status) { this.status = status; }

    public void setAmountInUSD(Double amountInUSD) { this.amountInUSD = amountInUSD; }

    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setMessage(String message) { this.message = message; } // Fixes PaymentService compile error

    // toString
    @Override
    public String toString() {
        return "PaymentRequestDTO{" +
                "orderId=" + orderId +
                ", gatewayType='" + gatewayType + '\'' +
                ", amountInPKR=" + amountInPKR +
                '}';
    }
}