package com.palette.palette.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.palette.palette.dto.CartItemRequestDTO;
import com.palette.palette.dto.CartResponseDTO;
import com.palette.palette.dto.OrderResponseDTO;
import com.palette.palette.dto.PaymentRequestDTO;
import com.palette.palette.dto.PaymentResponseDTO;
import com.palette.palette.entities.Order;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.repository.OrderRepository;
import com.palette.palette.repository.PaymentRepository;

/**
 * Checkout through the real services and database:
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
    @Autowired private PaymentRepository paymentRepository;

    private Long userId;

    @BeforeEach
    void registerFreshUser() {
        userId = TestUsers.register(authService).getUserId();
    }

    // ── Cart ─────────────────────────────────────────────────────────────────

    @Test
    void cartTotalsAddUpAcrossLines() {
        CartResponseDTO cart = fillCart();

        assertThat(cart.getLines()).hasSize(2);
        assertThat(cart.getGrandTotal()).isEqualTo(102_000);
    }

    @Test
    void addingTheSameProductTwiceIncreasesQuantity() {
        cartManager.addItemToCart(userId, product(6L, 1));
        CartResponseDTO cart = cartManager.addItemToCart(userId, product(6L, 2));

        assertThat(cart.getLines()).singleElement()
                .satisfies(line -> assertThat(line.getQuantity()).isEqualTo(3));
        assertThat(cart.getGrandTotal()).isEqualTo(36_000);
    }

    @Test
    void quantityIsCappedPerItem() {
        cartManager.addItemToCart(userId, product(6L, 60));

        assertThatThrownBy(() -> cartManager.addItemToCart(userId, product(6L, 60)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void removingALineReturnsTheUpdatedCart() {
        CartResponseDTO cart = fillCart();
        Long firstLine = cart.getLines().get(0).getCartItemId();

        CartResponseDTO after = cartManager.removeItemFromCart(userId, firstLine);

        assertThat(after.getLines()).hasSize(1);
    }

    @Test
    void cannotRemoveSomeoneElsesCartLine() {
        Long otherUser = TestUsers.register(authService).getUserId();
        Long theirLine = cartManager.addItemToCart(otherUser, product(6L, 1)).getLines().get(0).getCartItemId();

        assertThatThrownBy(() -> cartManager.removeItemFromCart(userId, theirLine))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── Orders ───────────────────────────────────────────────────────────────

    @Test
    void checkoutCreatesAPendingOrderAndEmptiesTheCart() {
        fillCart();

        OrderResponseDTO order = orderService.createOrderFromCart(userId);

        assertThat(order.getStatus()).isEqualTo(Order.OrderStatus.PENDING);
        assertThat(order.getGrandTotal()).isEqualTo(102_000);
        assertThat(order.getItems()).hasSize(2);
        assertThat(cartManager.getCartSummary(userId).getLines()).isEmpty();
    }

    @Test
    void checkoutWithAnEmptyCartIsRejected() {
        assertThatThrownBy(() -> orderService.createOrderFromCart(userId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("empty");
    }

    @Test
    void usersOnlySeeTheirOwnOrders() {
        OrderResponseDTO order = placeOrder();
        Long otherUser = TestUsers.register(authService).getUserId();

        assertThat(orderService.getUserOrders(otherUser)).isEmpty();
        assertThatThrownBy(() -> orderService.getOrderById(order.getOrderId(), otherUser))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── Payments ─────────────────────────────────────────────────────────────

    @Test
    void successfulPaymentChargesTheOrderTotalAndConfirmsTheOrder() {
        OrderResponseDTO order = placeOrder();

        PaymentResponseDTO payment = paymentService.processPayment(userId, pay(order, "JAZZCASH"));

        assertThat(payment.getStatus()).isEqualTo("SUCCESS");
        assertThat(payment.getAmountInPKR()).isEqualTo(102_000);
        assertThat(payment.getTransactionId()).startsWith("jazzcash_");
        assertThat(statusOf(order)).isEqualTo(Order.OrderStatus.CONFIRMED);
    }

    @Test
    void stripePaymentAlsoRecordsTheUsdAmount() {
        OrderResponseDTO order = placeOrder();

        PaymentResponseDTO payment = paymentService.processPayment(userId, pay(order, "stripe"));

        assertThat(payment.getStatus()).isEqualTo("SUCCESS");
        assertThat(payment.getAmountInUSD()).isCloseTo(102_000 / 280.0, within(0.01));
    }

    @Test
    void anOrderCannotBePaidTwice() {
        OrderResponseDTO order = placeOrder();
        paymentService.processPayment(userId, pay(order, "JAZZCASH"));

        assertThatThrownBy(() -> paymentService.processPayment(userId, pay(order, "JAZZCASH")))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void failedPaymentKeepsTheOrderOpenSoTheCustomerCanRetry() {
        OrderResponseDTO order = placeOrder();

        // ALFABANK is a known gateway but not implemented, so the charge fails.
        PaymentResponseDTO failed = paymentService.processPayment(userId, pay(order, "ALFABANK"));
        assertThat(failed.getStatus()).isEqualTo("FAILED");
        assertThat(statusOf(order)).isEqualTo(Order.OrderStatus.PENDING);

        PaymentResponseDTO retried = paymentService.processPayment(userId, pay(order, "STRIPE"));
        assertThat(retried.getStatus()).isEqualTo("SUCCESS");
        assertThat(retried.getPaymentId()).isEqualTo(failed.getPaymentId()); // one record per order
        assertThat(paymentRepository.findByOrderId(order.getOrderId())).isPresent();
        assertThat(statusOf(order)).isEqualTo(Order.OrderStatus.CONFIRMED);
    }

    @Test
    void unknownPaymentMethodIsRejected() {
        OrderResponseDTO order = placeOrder();

        assertThatThrownBy(() -> paymentService.processPayment(userId, pay(order, "PAYPAL")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void nobodyCanPayForSomeoneElsesOrder() {
        OrderResponseDTO order = placeOrder();
        Long otherUser = TestUsers.register(authService).getUserId();

        assertThatThrownBy(() -> paymentService.processPayment(otherUser, pay(order, "STRIPE")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static CartItemRequestDTO product(Long id, int quantity) {
        return new CartItemRequestDTO(id, quantity, "PRODUCT");
    }

    private CartResponseDTO fillCart() {
        cartManager.addItemToCart(userId, product(1L, 2));
        return cartManager.addItemToCart(userId, product(6L, 1));
    }

    private OrderResponseDTO placeOrder() {
        fillCart();
        return orderService.createOrderFromCart(userId);
    }

    private static PaymentRequestDTO pay(OrderResponseDTO order, String gateway) {
        return new PaymentRequestDTO(order.getOrderId(), gateway);
    }

    private Order.OrderStatus statusOf(OrderResponseDTO order) {
        return orderRepository.findById(order.getOrderId()).orElseThrow().getStatus();
    }
}
