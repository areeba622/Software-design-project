package com.palette.palette.patterns.adapter;

/**
 * ADAPTER PATTERN — the Target interface.
 *
 * <p>Palette thinks in Pakistani rupees. Every gateway is used through this one
 * interface, whatever currency or unit its own API expects:</p>
 *
 * <ul>
 *   <li>{@link StripeAdapter} adapts {@link StripeApi} (charges US cents)</li>
 *   <li>{@link JazzCashAdapter} adapts {@link JazzCashApi} (charges paisa)</li>
 * </ul>
 */
public interface LocalPaymentProcessor {

    /**
     * Charges an amount given in PKR.
     *
     * @return the gateway's transaction id
     */
    String payInPKR(double amountInPKR);

    /** e.g. "STRIPE". */
    String getGatewayType();
}
