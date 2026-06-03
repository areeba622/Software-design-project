package com.palette.palette.dto;

import java.time.LocalDateTime;

public class PaymentResponseDTO {

    private Long paymentId;
    private Long orderId;
    private String gateway;
    private String status;
    private Double amountInPKR;
    private Double amountInUSD;
    private String transactionId;
    private LocalDateTime createdAt;
    private String message;

    // Constructors
    public PaymentResponseDTO() {
    }

    public PaymentResponseDTO(Long paymentId, Long orderId, String gateway,
                              String status, Double amountInPKR, String transactionId,
                              LocalDateTime createdAt, String message) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.gateway = gateway;
        this.status = status;
        this.amountInPKR = amountInPKR;
        this.transactionId = transactionId;
        this.createdAt = createdAt;
        this.message = message;
    }

    // Getters
    public Long getPaymentId() {
        return paymentId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getGateway() {
        return gateway;
    }

    public String getStatus() {
        return status;
    }

    public Double getAmountInPKR() {
        return amountInPKR;
    }

    public Double getAmountInUSD() {
        return amountInUSD;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getMessage() {
        return message;
    }

    // Setters
    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public void setGateway(String gateway) {
        this.gateway = gateway;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setAmountInPKR(Double amountInPKR) {
        this.amountInPKR = amountInPKR;
    }

    public void setAmountInUSD(Double amountInUSD) {
        this.amountInUSD = amountInUSD;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    // toString
    @Override
    public String toString() {
        return "PaymentResponseDTO{" +
                "paymentId=" + paymentId +
                ", orderId=" + orderId +
                ", gateway='" + gateway + '\'' +
                ", status='" + status + '\'' +
                ", amountInPKR=" + amountInPKR +
                ", amountInUSD=" + amountInUSD +
                ", transactionId='" + transactionId + '\'' +
                ", createdAt=" + createdAt +
                ", message='" + message + '\'' +
                '}';
    }
}