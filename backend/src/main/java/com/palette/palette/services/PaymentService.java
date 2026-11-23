package com.palette.palette.services;

import java.util.Arrays;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.palette.palette.dto.PaymentRequestDTO;
import com.palette.palette.dto.PaymentResponseDTO;
import com.palette.palette.entities.Order;
import com.palette.palette.entities.Payment;
import com.palette.palette.entities.Payment.PaymentGateway;
import com.palette.palette.entities.Payment.PaymentStatus;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.patterns.adapter.StripeAdapter;
import com.palette.palette.patterns.singleton.PaymentManager;
import com.palette.palette.repository.OrderRepository;
import com.palette.palette.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

/**
 * Pays for orders through {@link PaymentManager} (Singleton → Adapter).
 *
 * <ul>
 *   <li>The amount charged is always the order's own total — never a client value.</li>
 *   <li>Only the order's owner can pay it, and only while it is PENDING.</li>
 *   <li>A failed charge is recorded as FAILED and the order stays PENDING, so the
 *       customer can try again (each order keeps a single payment record).</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentManager paymentManager;

    /**
     * The gateway call is an in-memory stub that cannot leave the database half
     * updated, so one transaction covers the whole attempt. A gateway failure is
     * caught and saved as FAILED; it does not roll anything back.
     */
    @Transactional
    public PaymentResponseDTO processPayment(Long userId, PaymentRequestDTO dto) {
        Order order = orderRepository.findByIdAndUserId(dto.getOrderId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + dto.getOrderId()));
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalStateException("This order has already been paid.");
        }
        PaymentGateway gateway = parseGateway(dto.getGatewayType());
        double amount = order.getGrandTotal();

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> new Payment(order, gateway, amount));
        payment.setGateway(gateway);
        payment.setAmountInPKR(amount);

        try {
            String transactionId = paymentManager.processOrder(gateway.name(), amount);
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(transactionId);
            payment.setAmountInUSD(gateway == PaymentGateway.STRIPE ? StripeAdapter.convertPKRToUSD(amount) : null);
            order.setStatus(Order.OrderStatus.CONFIRMED);
            return toResponse(paymentRepository.save(payment), "Payment successful!");
        } catch (RuntimeException e) {
            log.warn("Payment for order {} failed: {}", order.getId(), e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setTransactionId(null);
            payment.setAmountInUSD(null);
            return toResponse(paymentRepository.save(payment), "Payment failed: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentByOrderId(Long orderId, Long userId) {
        orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment yet for order " + orderId));
        return toResponse(payment, null);
    }

    private static PaymentGateway parseGateway(String raw) {
        try {
            return PaymentGateway.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown payment method '" + raw + "'. Accepted: "
                    + Arrays.toString(PaymentGateway.values()));
        }
    }

    private static PaymentResponseDTO toResponse(Payment payment, String message) {
        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setPaymentId(payment.getId());
        response.setOrderId(payment.getOrder().getId());
        response.setGateway(payment.getGateway() != null ? payment.getGateway().name() : null);
        response.setStatus(payment.getStatus().name());
        response.setAmountInPKR(payment.getAmountInPKR());
        response.setAmountInUSD(payment.getAmountInUSD());
        response.setTransactionId(payment.getTransactionId());
        response.setCreatedAt(payment.getCreatedAt());
        response.setMessage(message);
        return response;
    }
}
