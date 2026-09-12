package com.palette.palette.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
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
     *
     * IMPORTANT: this method is intentionally NOT @Transactional anymore.
     * The success path and the failure path each run in their OWN
     * transaction (see processSuccessfulPayment / recordFailedPayment).
     * Why: previously, everything ran in a single @Transactional method.
     * When the gateway call or the success-save threw an exception,
     * Spring marked that whole transaction "rollback-only". The catch
     * block then tried to save a FAILED payment using the SAME
     * transaction, which Spring silently rolled back too — that's why
     * you were seeing blank/default values instead of either a real
     * success OR a real recorded failure.
     */
    public PaymentResponseDTO processPayment(PaymentRequestDTO dto) {

        // Step 1: Load the Order (read-only, no need for a write transaction yet)
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + dto.getOrderId()));

        // Step 2: Validate gateway type up front, before touching the DB
        String gatewayType = dto.getGatewayType().toUpperCase();
        validateGatewayType(gatewayType);

        // Step 3: Create Payment entity (not yet saved)
        Payment payment = new Payment(order, null, dto.getAmountInPKR());

        try {
            System.out.println("PaymentService: Initiating payment via " + gatewayType);

            // Step 4: Call Singleton PaymentManager (this is the actual charge)
            String transactionId = paymentManager.processOrder(gatewayType, dto.getAmountInPKR());

            // Step 5: Charge succeeded -> persist in its own transaction
            Payment saved = processSuccessfulPayment(payment, order, gatewayType, transactionId, dto.getAmountInPKR());

            System.out.println("PaymentService: Payment SUCCESS. TxID: " + transactionId);
            return buildSuccessResponse(saved);

        } catch (Exception e) {
            // Step 6: Charge failed (or DB save failed) -> record failure in its OWN
            // fresh transaction, completely separate from whatever failed above.
            System.err.println("PaymentService: Payment FAILED. " + e.getMessage());

            Payment failedPayment = recordFailedPayment(payment, order);
            return buildFailureResponse(failedPayment, e.getMessage());
        }
    }

    /**
     * Runs in its own NEW transaction. If this fails, it does not affect
     * or get affected by any other transaction.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Payment processSuccessfulPayment(Payment payment, Order order, String gatewayType,
            String transactionId, Double amountInPKR) {

        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setTransactionId(transactionId);
        payment.setGateway(Payment.PaymentGateway.valueOf(gatewayType));

        // If Stripe, also store USD conversion
        if (gatewayType.equals("STRIPE")) {
            double amountInUSD = new StripeAdapter().convertPKRToUSD(amountInPKR);
            payment.setAmountInUSD(amountInUSD);
        }

        Payment saved = paymentRepository.save(payment);

        order.setStatus(Order.OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return saved;
    }

    /**
     * Runs in its own NEW transaction so it can succeed even if the
     * transaction that attempted the actual charge was rolled back.
     * gateway is left null here on purpose (e.g. charge never even
     * started, or gateway adapter threw before returning a tx id) —
     * the entity now allows that.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Payment recordFailedPayment(Payment payment, Order order) {
        payment.setStatus(Payment.PaymentStatus.FAILED);
        Payment saved = paymentRepository.save(payment);

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);

        return saved;
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
        response.setGateway(payment.getGateway() != null ? payment.getGateway().toString() : null);
        response.setStatus(payment.getStatus().toString());
        response.setAmountInPKR(payment.getAmountInPKR());
        response.setAmountInUSD(payment.getAmountInUSD());
        response.setTransactionId(payment.getTransactionId());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }
}