package com.palette.palette.patterns.singleton;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.palette.palette.patterns.adapter.JazzCashAdapter;
import com.palette.palette.patterns.adapter.LocalPaymentProcessor;
import com.palette.palette.patterns.adapter.StripeAdapter;

/**
 * SINGLETON: the one entry point for charging money.
 *
 * <p>Lazy, thread-safe initialisation with double-checked locking. Spring does
 * not construct this class itself: {@code PaymentConfig} registers
 * {@link #getInstance()} as the bean, so the app and any plain-Java caller
 * share exactly one instance.</p>
 *
 * <p>It picks the right {@link LocalPaymentProcessor} adapter (Adapter pattern)
 * for the gateway the customer chose.</p>
 */
public final class PaymentManager {

    private static final Logger log = LoggerFactory.getLogger(PaymentManager.class);

    private static volatile PaymentManager instance;

    private PaymentManager() {
        log.info("PaymentManager singleton created");
    }

    public static PaymentManager getInstance() {
        PaymentManager result = instance;
        if (result == null) {                       // 1st check, no lock
            synchronized (PaymentManager.class) {
                result = instance;
                if (result == null) {               // 2nd check, with lock
                    instance = result = new PaymentManager();
                }
            }
        }
        return result;
    }

    /**
     * Charges {@code amountInPKR} through the named gateway.
     *
     * @return the gateway's transaction id
     * @throws IllegalArgumentException for an unknown gateway or a non-positive amount
     */
    public String processOrder(String gatewayType, double amountInPKR) {
        if (gatewayType == null || gatewayType.isBlank()) {
            throw new IllegalArgumentException("Gateway type cannot be empty");
        }
        return processOrder(selectAdapter(gatewayType.trim().toUpperCase(Locale.ROOT)), amountInPKR);
    }

    /** Charges through a specific adapter (handy for tests or new gateways). */
    public String processOrder(LocalPaymentProcessor adapter, double amountInPKR) {
        if (adapter == null) {
            throw new IllegalArgumentException("Adapter cannot be null");
        }
        if (amountInPKR <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        log.info("Charging PKR {} via {}", amountInPKR, adapter.getGatewayType());
        String transactionId = adapter.payInPKR(amountInPKR);
        log.info("Charge succeeded: {}", transactionId);
        return transactionId;
    }

    private static LocalPaymentProcessor selectAdapter(String gatewayType) {
        return switch (gatewayType) {
            case "STRIPE" -> new StripeAdapter();
            case "JAZZCASH" -> new JazzCashAdapter();
            case "ALFABANK" -> throw new IllegalArgumentException("ALFABANK is not supported yet");
            default -> throw new IllegalArgumentException("Unknown gateway type: " + gatewayType);
        };
    }
}
