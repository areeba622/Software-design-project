package com.palette.palette.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * A single payment attempt for an {@link Order}.
 * Amounts are always stored in PKR; {@code amountInUSD} is only filled in
 * when the charge went through a USD gateway (Stripe).
 */
@Entity
@Table(name = "payments")
public class Payment {

    public enum PaymentGateway { STRIPE, JAZZCASH, ALFABANK }

    public enum PaymentStatus { PENDING, SUCCESS, FAILED, CANCELLED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    /** Null when the attempt failed before a gateway was chosen. */
    @Enumerated(EnumType.STRING)
    private PaymentGateway gateway;

    @Column(name = "amount_pkr", nullable = false)
    private Double amountInPKR;

    @Column(name = "amount_usd")
    private Double amountInUSD;

    private String transactionId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Payment() {
    }

    public Payment(Order order, PaymentGateway gateway, Double amountInPKR) {
        this.order = order;
        this.gateway = gateway;
        this.amountInPKR = amountInPKR;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public PaymentGateway getGateway() { return gateway; }
    public void setGateway(PaymentGateway gateway) { this.gateway = gateway; }

    public Double getAmountInPKR() { return amountInPKR; }
    public void setAmountInPKR(Double amountInPKR) { this.amountInPKR = amountInPKR; }

    public Double getAmountInUSD() { return amountInUSD; }
    public void setAmountInUSD(Double amountInUSD) { this.amountInUSD = amountInUSD; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Payment that = (Payment) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Payment{id=" + id + ", status=" + status + ", gateway=" + gateway
                + ", amountInPKR=" + amountInPKR + ", transactionId='" + transactionId + "'}";
    }
}
