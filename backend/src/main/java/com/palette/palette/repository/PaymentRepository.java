package com.palette.palette.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.palette.palette.entities.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find payment by Order ID (one-to-one relation)
    Optional<Payment> findByOrderId(Long orderId);

    // Find payment by external transaction ID (from Stripe/JazzCash)
    Optional<Payment> findByTransactionId(String transactionId);

    // Find all payments by status
    java.util.List<Payment> findByStatus(Payment.PaymentStatus status);

    // Find all payments by gateway type
    java.util.List<Payment> findByGateway(Payment.PaymentGateway gateway);
}