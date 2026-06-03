package com.palette.palette.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.palette.palette.dto.PaymentRequestDTO;
import com.palette.palette.dto.PaymentResponseDTO;
import com.palette.palette.entities.Order;
import com.palette.palette.entities.Payment;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.patterns.adapter.StripeAdapter;
import com.palette.palette.patterns.singleton.PaymentManager;
import com.palette.palette.repository.OrderRepository;
import com.palette.palette.repository.PaymentRepository;

/**
 * PaymentService: Orchestrates payment processing.
 * Routes to PaymentManager (Singleton) which selects the appropriate Adapter.
 * Manages Payment entity persistence and Order status updates.
 */
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentManager paymentManager;

    // Constructor injection
    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          PaymentManager paymentManager) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.paymentManager = paymentManager;
    }

    /**
     * Process a payment for an order.
     * Called from PaymentController.
     * Flow:
     *   1. Load Order from DB
     *   2. Call PaymentManager.processOrder() (Singleton + Adapter)
     *   3. Save Payment record
     *   4. Update Order status to CONFIRMED
     *   5. Return PaymentResponseDTO
     */
    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO dto) {

        // Step 1: Load the Order
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + dto.getOrderId()));

        // Step 2: Create Payment entity
        Payment payment = new Payment(order, null, dto.getAmountInPKR());

        // Step 3: Determine gateway from user's currency preference or DTO
        String gatewayType = dto.getGatewayType().toUpperCase();
        validateGatewayType(gatewayType);

        try {
            // Step 4: Call Singleton PaymentManager
            // PaymentManager internally selects Adapter (Stripe or JazzCash)
            System.out.println("PaymentService: Initiating payment via " + gatewayType);

            String transactionId = paymentManager.processOrder(gatewayType,
                    dto.getAmountInPKR());

            // Step 5: Payment succeeded — update Payment entity
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionId(transactionId);
            payment.setGateway(Payment.PaymentGateway.valueOf(gatewayType));

            // If Stripe, also store USD conversion
            if (gatewayType.equals("STRIPE")) {
                double amountInUSD = new StripeAdapter().convertPKRToUSD(
                        dto.getAmountInPKR());
                payment.setAmountInUSD(amountInUSD);
            }

            // Step 6: Persist Payment
            Payment saved = paymentRepository.save(payment);

            // Step 7: Update Order status
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);

            System.out.println("PaymentService: Payment SUCCESS. TxID: " + transactionId);

            // Step 8: Build response
            return buildSuccessResponse(saved);

        } catch (Exception e) {

            // Payment failed
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);

            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);

            System.err.println("PaymentService: Payment FAILED. " + e.getMessage());

            return buildFailureResponse(payment, e.getMessage());
        }
    }

    /**
     * Get payment details by payment ID.
     */
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentById(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with id: " + paymentId));

        return buildPaymentResponse(payment);
    }

    /**
     * Get payment by transaction ID (from Stripe/JazzCash).
     */
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentByTransactionId(String transactionId) {

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with transaction ID: " + transactionId));

        return buildPaymentResponse(payment);
    }

    /**
     * Get payment by Order ID (one-to-one relation).
     */
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentByOrderId(Long orderId) {

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for order ID: " + orderId));

        return buildPaymentResponse(payment);
    }

    // ── Helper Methods ─────────────────────────────────────────────────────

    private void validateGatewayType(String gatewayType) {
        if (!gatewayType.equals("STRIPE") &&
                !gatewayType.equals("JAZZCASH") &&
                !gatewayType.equals("ALFABANK")) {
            throw new IllegalArgumentException(
                    "Invalid gateway type: " + gatewayType +
                    ". Accepted: STRIPE, JAZZCASH, ALFABANK");
        }
    }

    private PaymentResponseDTO buildSuccessResponse(Payment payment) {
        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setPaymentId(payment.getId());
        response.setOrderId(payment.getOrder().getId());
        response.setGateway(payment.getGateway().toString());
        response.setStatus(payment.getStatus().toString());
        response.setAmountInPKR(payment.getAmountInPKR());
        response.setAmountInUSD(payment.getAmountInUSD());
        response.setTransactionId(payment.getTransactionId());
        response.setCreatedAt(payment.getCreatedAt());
        response.setMessage("Payment successful!");
        return response;
    }

    private PaymentResponseDTO buildFailureResponse(Payment payment, String errorMessage) {
        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setPaymentId(payment.getId());
        response.setOrderId(payment.getOrder().getId());
        response.setStatus(payment.getStatus().toString());
        response.setAmountInPKR(payment.getAmountInPKR());
        response.setCreatedAt(payment.getCreatedAt());
        response.setMessage("Payment failed: " + errorMessage);
        return response;
    }

    private PaymentResponseDTO buildPaymentResponse(Payment payment) {
        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setPaymentId(payment.getId());
        response.setOrderId(payment.getOrder().getId());
        response.setGateway(payment.getGateway() != null ?
                payment.getGateway().toString() : null);
        response.setStatus(payment.getStatus().toString());
        response.setAmountInPKR(payment.getAmountInPKR());
        response.setAmountInUSD(payment.getAmountInUSD());
        response.setTransactionId(payment.getTransactionId());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }
}