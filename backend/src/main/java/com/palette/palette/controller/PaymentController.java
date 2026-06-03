package com.palette.palette.controller;

import com.palette.palette.dto.PaymentRequestDTO;
import com.palette.palette.dto.PaymentResponseDTO;
import com.palette.palette.services.PaymentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * PaymentController: REST endpoint for payment operations.
 * Exposes:
 *   POST /api/payment/process       → charge for an order
 *   GET  /api/payment/{id}          → fetch payment by ID
 *   GET  /api/payment/tx/{txId}     → fetch by transaction ID
 *   GET  /api/payment/order/{orderId} → fetch by order ID
 */
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    // Constructor injection
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * POST /api/payment/process
     * Process a new payment for an order.
     * Body: { "orderId": 1, "gatewayType": "JAZZCASH", "amountInPKR": 75000 }
     */
    @PostMapping("/process")
    public ResponseEntity<PaymentResponseDTO> processPayment(
            @Valid @RequestBody PaymentRequestDTO dto) {

        System.out.println("PaymentController: processPayment called with: " + dto);

        PaymentResponseDTO response = paymentService.processPayment(dto);

        // Return 201 CREATED if successful, 400 if failed
        if ("SUCCESS".equals(response.getStatus())) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * GET /api/payment/{id}
     * Retrieve payment by payment ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {

        System.out.println("PaymentController: getPaymentById called with id=" + id);

        PaymentResponseDTO response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/payment/tx/{transactionId}
     * Retrieve payment by external transaction ID (from Stripe/JazzCash).
     */
    @GetMapping("/tx/{transactionId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentByTransactionId(
            @PathVariable String transactionId) {

        System.out.println("PaymentController: getPaymentByTransactionId called with txId="
                + transactionId);

        PaymentResponseDTO response = paymentService.getPaymentByTransactionId(
                transactionId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/payment/order/{orderId}
     * Retrieve payment associated with an order (one-to-one).
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentByOrderId(
            @PathVariable Long orderId) {

        System.out.println("PaymentController: getPaymentByOrderId called with orderId="
                + orderId);

        PaymentResponseDTO response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint to verify PaymentManager is operational.
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        System.out.println("PaymentController: Health check requested");
        return ResponseEntity.ok("Payment service is operational.");
    }
}