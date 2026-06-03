package com.palette.palette.patterns.singleton;

import org.springframework.stereotype.Component;

import com.palette.palette.patterns.adapter.JazzCashAdapter;
import com.palette.palette.patterns.adapter.LocalPaymentProcessor;
import com.palette.palette.patterns.adapter.StripeAdapter;

/**
 * Singleton: Thread-safe payment manager.
 * Single entry point for all payment processing across the entire application.
 * Uses double-checked locking pattern for lazy initialization.
 * Routes to appropriate Adapter (Stripe or JazzCash) based on gateway type.
 */
@Component
public class PaymentManager {

    private static volatile PaymentManager instance;
    private static final Object lock = new Object();

    // Private constructor — enforces singleton
    private PaymentManager() {
        System.out.println("PaymentManager singleton instance created.");
    }

    /**
     * Thread-safe getInstance using double-checked locking.
     * Ensures only one PaymentManager exists across the entire JVM.
     */
    public static PaymentManager getInstance() {
        if (instance == null) { // 1st check (no lock)
            synchronized (lock) { // acquire lock
                if (instance == null) { // 2nd check (with lock)
                    instance = new PaymentManager();
                }
            }
        }
        return instance;
    }

    /**
     * Process an order payment by routing to the correct gateway adapter.
     *
     * @param gatewayType gateway name: "STRIPE" or "JAZZCASH"
     * @param amountInPKR amount to charge in Pakistani Rupees
     * @return transaction ID from the gateway
     * @throws IllegalArgumentException if gateway type is unknown
     */
    public String processOrder(String gatewayType, double amountInPKR) {

        if (gatewayType == null || gatewayType.trim().isEmpty()) {
            throw new IllegalArgumentException("Gateway type cannot be null or empty");
        }

        if (amountInPKR <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }

        String normalizedGateway = gatewayType.toUpperCase().trim();
        LocalPaymentProcessor processor = selectAdapter(normalizedGateway);

        System.out.println("PaymentManager: Processing PKR " + amountInPKR +
                " via " + normalizedGateway);

        String transactionId = processor.payInPKR(amountInPKR);

        System.out.println("PaymentManager: Payment processed. TxID: " + transactionId);

        return transactionId;
    }

    /**
     * Select the appropriate adapter based on gateway type.
     * This is where the Adapter pattern does its work.
     */
    private LocalPaymentProcessor selectAdapter(String gatewayType) {
        switch (gatewayType) {
            case "STRIPE":
                System.out.println("PaymentManager: Selected StripeAdapter");
                return new StripeAdapter();

            case "JAZZCASH":
                System.out.println("PaymentManager: Selected JazzCashAdapter");
                return new JazzCashAdapter();

            case "ALFABANK":
                // Future gateway support
                throw new IllegalArgumentException("ALFABANK not yet implemented");

            default:
                throw new IllegalArgumentException("Unknown gateway type: " + gatewayType);
        }
    }

    /**
     * Overloaded method: Process with explicit adapter instance.
     * Useful for testing or custom adapter implementations.
     */
    public String processOrder(LocalPaymentProcessor adapter, double amountInPKR) {

        if (adapter == null) {
            throw new IllegalArgumentException("Adapter cannot be null");
        }

        if (amountInPKR <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }

        System.out.println("PaymentManager: Processing PKR " + amountInPKR +
                " via custom adapter: " + adapter.getGatewayType());

        String transactionId = adapter.payInPKR(amountInPKR);

        System.out.println("PaymentManager: Payment processed. TxID: " + transactionId);

        return transactionId;
    }

    /**
     * Health check: Verify PaymentManager is operational.
     */
    public boolean isHealthy() {
        try {
            return new StripeAdapter().getGatewayType() != null &&
                    new JazzCashAdapter().getGatewayType() != null;
        } catch (Exception e) {
            System.err.println("PaymentManager health check failed: " + e.getMessage());
            return false;
        }
    }
}