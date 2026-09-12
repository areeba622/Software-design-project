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

    // id bigint NOT NULL
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // order_id bigint NOT NULL
    @OneToOne(optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // status character varying(255) NOT NULL
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    // gateway character varying(255)
    // NOTE: made nullable here on purpose. A Payment object is created
    // BEFORE we know whether the charge will succeed, and the gateway
    // value is only set once we know which adapter actually ran. If this
    // field were NOT NULL, saving a FAILED payment (created before the
    // gateway call even happens, or when validation fails) would itself
    // throw a constraint violation and silently swallow the real error.
    @Enumerated(EnumType.STRING)
    @Column(name = "gateway")
    private PaymentGateway gateway;

    // amountpkr double precision NOT NULL
    @Column(name = "amountpkr", nullable = false)
    private Double amountpkr;

    // amountusd double precision
    @Column(name = "amountusd")
    private Double amountusd;

    // amount_inpkr double precision NOT NULL
    @Column(name = "amount_inpkr", nullable = false)
    private Double amountInPKR;

    // amount_inusd double precision
    @Column(name = "amount_inusd")
    private Double amountInUSD;

    // transaction_id character varying(255)
    @Column(name = "transaction_id")
    private String transactionId;

    // transactionid character varying(255)
    @Column(name = "transactionid")
    private String transactionidLegacy;

    // created_at timestamp NOT NULL
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // createdat timestamp NOT NULL
    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdatLegacy;

    // status_val character varying(255)
    @Column(name = "status_val")
    private String statusVal;

    // gateway_val character varying(255)
    @Column(name = "gateway_val")
    private String gatewayVal;

    public enum PaymentGateway {
        STRIPE, JAZZCASH, ALFABANK
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, CANCELLED
    }

    // ── Constructors ──────────────────────────────────────────────────────────
    public Payment() {
    }

    public Payment(Order order, PaymentGateway gateway, Double amountInPKR) {
        this.order = order;
        this.gateway = gateway; // may be null at creation time, set later on success
        this.amountInPKR = amountInPKR;
        this.amountpkr = amountInPKR; // keep amountpkr (NOT NULL) in sync
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.createdatLegacy = now; // keep createdat (NOT NULL) in sync
        this.status = PaymentStatus.PENDING;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public PaymentGateway getGateway() {
        return gateway;
    }

    public void setGateway(PaymentGateway gateway) {
        this.gateway = gateway;
        this.gatewayVal = gateway != null ? gateway.toString() : null; // keep gateway_val in sync
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
        this.statusVal = status != null ? status.toString() : null; // keep status_val in sync
    }

    public Double getAmountInPKR() {
        return amountInPKR;
    }

    public void setAmountInPKR(Double amountInPKR) {
        this.amountInPKR = amountInPKR;
        this.amountpkr = amountInPKR; // keep amountpkr in sync
    }

    public Double getAmountpkr() {
        return amountpkr;
    }

    public void setAmountpkr(Double amountpkr) {
        this.amountpkr = amountpkr;
        this.amountInPKR = amountpkr;
    }

    public Double getAmountInUSD() {
        return amountInUSD;
    }

    public void setAmountInUSD(Double amountInUSD) {
        this.amountInUSD = amountInUSD;
        this.amountusd = amountInUSD; // keep amountusd in sync
    }

    public Double getAmountusd() {
        return amountusd;
    }

    public void setAmountusd(Double amountusd) {
        this.amountusd = amountusd;
        this.amountInUSD = amountusd;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
        this.transactionidLegacy = transactionId; // keep transactionid in sync
    }

    public String getTransactionidLegacy() {
        return transactionidLegacy;
    }

    public void setTransactionidLegacy(String transactionidLegacy) {
        this.transactionidLegacy = transactionidLegacy;
        this.transactionId = transactionidLegacy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        this.createdatLegacy = createdAt; // keep createdat in sync
    }

    public LocalDateTime getCreatedatLegacy() {
        return createdatLegacy;
    }

    public void setCreatedatLegacy(LocalDateTime createdatLegacy) {
        this.createdatLegacy = createdatLegacy;
        this.createdAt = createdatLegacy;
    }

    public String getStatusVal() {
        return statusVal;
    }

    public void setStatusVal(String statusVal) {
        this.statusVal = statusVal;
    }

    public String getGatewayVal() {
        return gatewayVal;
    }

    public void setGatewayVal(String gatewayVal) {
        this.gatewayVal = gatewayVal;
    }

    // ── equals & hashCode ─────────────────────────────────────────────────────
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
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