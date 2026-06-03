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
import jakarta.persistence.Table;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentGateway gateway;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false)
    private Double amountInPKR;

    private Double amountInUSD;  // converted for Stripe

    private String transactionId;  // from gateway

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum PaymentGateway {
        STRIPE, JAZZCASH, ALFABANK
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, CANCELLED
    }

    // ── Constructors ──────────────────────────────────────────────────────────
    public Payment() {}

    public Payment(Order order, PaymentGateway gateway, Double amountInPKR) {
        this.order = order;
        this.gateway = gateway;
        this.amountInPKR = amountInPKR;
        this.createdAt = LocalDateTime.now();
        this.status = PaymentStatus.PENDING;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public PaymentGateway getGateway() { return gateway; }
    public void setGateway(PaymentGateway gateway) { this.gateway = gateway; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public Double getAmountInPKR() { return amountInPKR; }
    public void setAmountInPKR(Double amountInPKR) { this.amountInPKR = amountInPKR; }

    public Double getAmountInUSD() { return amountInUSD; }
    public void setAmountInUSD(Double amountInUSD) { this.amountInUSD = amountInUSD; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // ── equals & hashCode ─────────────────────────────────────────────────────
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Payment payment = (Payment) o;
        return id != null && id.equals(payment.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "Payment{" +
                "id=" + id +
                ", gateway=" + gateway +
                ", status=" + status +
                ", amountInPKR=" + amountInPKR +
                ", createdAt=" + createdAt +
                '}';
    }
}