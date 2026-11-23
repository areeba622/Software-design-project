package com.palette.palette.services;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.palette.palette.dto.AuthResponseDTO;
import com.palette.palette.dto.CartItemRequestDTO;
import com.palette.palette.dto.CartResponseDTO;
import com.palette.palette.dto.OrderRequestDTO;
import com.palette.palette.dto.OrderResponseDTO;
import com.palette.palette.dto.PaymentRequestDTO;
import com.palette.palette.dto.PaymentResponseDTO;
import com.palette.palette.dto.RegisterRequestDTO;
import com.palette.palette.entities.Order;
import com.palette.palette.entities.User.CurrencyPreference;
import com.palette.palette.repository.OrderRepository;

/**
 * End-to-end checkout through the real services and database:
 * register -> add to cart -> create order -> pay.
 * Seed prices used: product 1 = 45,000 PKR, product 6 = 12,000 PKR.
 */
@SpringBootTest
class CheckoutFlowTest {

    @Autowired private AuthService authService;
    @Autowired private CartManager cartManager;
    @Autowired private OrderService orderService;
    @Autowired private PaymentService paymentService;
    @Autowired private OrderRepository orderRepository;

    private Long userId;

    @BeforeEach
    void registerFreshUser() {
        RegisterRequestDTO register = new RegisterRequestDTO();
        register.setFullName("Test Shopper");
        register.setEmail("shopper-" + UUID.randomUUID() + "@example.com");
        register.setPassword("secret123");
        register.setCurrencyPreference(CurrencyPreference.PKR);

        AuthResponseDTO user = authService.register(register);
        userId = user.getUserId();
    }

    @Test
    void cartTotalsAddUpAcrossLines() {
        CartResponseDTO cart = fillCart();

        assertThat(cart.getLines()).hasSize(2);
        assertThat(cart.getGrandTotal()).isEqualTo(102_000);
    }

    @Test
    void addingTheSameProductTwiceIncreasesQuantity() {
        cartManager.addItemToCart(userId, new CartItemRequestDTO(6L, 1, "PRODUCT", null));
        cartManager.addItemToCart(userId, new CartItemRequestDTO(6L, 2, "PRODUCT", null));

        CartResponseDTO cart = cartManager.getCartSummary(userId);

        assertThat(cart.getLines()).singleElement()
                .satisfies(line -> assertThat(line.getQuantity()).isEqualTo(3));
        assertThat(cart.getGrandTotal()).isEqualTo(36_000);
    }

    @Test
    void checkoutCreatesAPendingOrderAndEmptiesTheCart() {
        CartResponseDTO cart = fillCart();

        OrderResponseDTO order = orderService.createOrderFromCart(new OrderRequestDTO(userId, cart.getCartId()));

        assertThat(order.getStatus()).isEqualTo(Order.OrderStatus.PENDING);
        assertThat(order.getGrandTotal()).isEqualTo(102_000);
        assertThat(order.getItems()).hasSize(2);
        assertThat(cartManager.getCartSummary(userId).getLines()).isEmpty();
    }

    @Test
    void successfulPaymentConfirmsTheOrder() {
        OrderResponseDTO order = placeOrder();

        PaymentResponseDTO payment = paymentService.processPayment(paymentFor(order, "JAZZCASH"));

        assertThat(payment.getStatus()).isEqualTo("SUCCESS");
        assertThat(payment.getTransactionId()).startsWith("jazzcash_");
        assertThat(orderRepository.findById(order.getOrderId()).orElseThrow().getStatus())
                .isEqualTo(Order.OrderStatus.CONFIRMED);
    }

    @Test
    void stripePaymentAlsoRecordsTheUsdAmount() {
        OrderResponseDTO order = placeOrder();

        PaymentResponseDTO payment = paymentService.processPayment(paymentFor(order, "STRIPE"));

        assertThat(payment.getStatus()).isEqualTo("SUCCESS");
        assertThat(payment.getAmountInUSD()).isCloseTo(102_000 / 280.0, org.assertj.core.data.Offset.offset(0.01));
    }

    @Test
    void failedPaymentIsRecordedInsteadOfCrashing() {
        OrderResponseDTO order = placeOrder();

        // ALFABANK passes validation but the gateway is not implemented, so the charge fails.
        PaymentResponseDTO payment = paymentService.processPayment(paymentFor(order, "ALFABANK"));

        assertThat(payment.getStatus()).isEqualTo("FAILED");
        assertThat(payment.getPaymentId()).isNotNull();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private CartResponseDTO fillCart() {
        cartManager.addItemToCart(userId, new CartItemRequestDTO(1L, 2, "PRODUCT", null));
        cartManager.addItemToCart(userId, new CartItemRequestDTO(6L, 1, "PRODUCT", null));
        return cartManager.getCartSummary(userId);
    }

    private OrderResponseDTO placeOrder() {
        CartResponseDTO cart = fillCart();
        return orderService.createOrderFromCart(new OrderRequestDTO(userId, cart.getCartId()));
    }

    private static PaymentRequestDTO paymentFor(OrderResponseDTO order, String gateway) {
        PaymentRequestDTO dto = new PaymentRequestDTO();
        dto.setOrderId(order.getOrderId());
        dto.setGatewayType(gateway);
        dto.setAmountInPKR(order.getGrandTotal());
        return dto;
    }
}
