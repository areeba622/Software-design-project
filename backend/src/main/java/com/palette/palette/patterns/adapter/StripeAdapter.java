package com.palette.palette.patterns.adapter;

import java.util.UUID;

/**
 * Adapter: Converts PKR payments to Stripe's USD + cents format.
 * Stripe expects: amount in cents (integer), currency = USD.
 * Conversion: PKR → USD (÷280) → cents (×100)
 */
public class StripeAdapter implements LocalPaymentProcessor {

    private final StripeSDK stripeSDK;

    /** Fixed demo exchange rate: 1 USD = 280 PKR. */
    public static final double PKR_TO_USD_RATE = 280.0;

    // Constructors
    public StripeAdapter() {
        this.stripeSDK = new StripeSDK();
    }

    public StripeAdapter(StripeSDK stripeSDK) {
        this.stripeSDK = stripeSDK;
    }

    @Override
    public String payInPKR(double amountInPKR) {

        // Step 1: Convert PKR to USD
        double amountInUSD = amountInPKR / PKR_TO_USD_RATE;

        // Step 2: Convert USD to cents (Stripe works in cents)
        int amountInCents = (int) Math.round(amountInUSD * 100);

        // Step 3: Call Stripe SDK with converted amount
        System.out.println("StripeAdapter: Converting PKR " + amountInPKR +
                " to USD " + amountInUSD +
                " to cents " + amountInCents);

        return stripeSDK.chargeInCents(amountInCents);
    }

    @Override
    public String getGatewayType() {
        return "STRIPE";
    }

    public double getPKRToUSDRate() {
        return PKR_TO_USD_RATE;
    }

    public static double convertPKRToUSD(double amountInPKR) {
        return amountInPKR / PKR_TO_USD_RATE;
    }

    // ── Inner Stub: StripeSDK ──────────────────────────────────────────

    /**
     * Stub implementation of Stripe SDK.
     * In production, this would call actual Stripe API.
     */
    public static class StripeSDK {

        public String chargeInCents(int cents) {
            // Simulate Stripe charge
            String transactionId = "stripe_" + UUID.randomUUID().toString();
            System.out.println("StripeSDK: Charged " + cents + " cents. TxID: " + transactionId);
            return transactionId;
        }

        public String refund(String transactionId, int refundCents) {
            String refundId = "refund_" + UUID.randomUUID().toString();
            System.out.println("StripeSDK: Refunded " + refundCents + " cents for TxID: "
                    + transactionId + ". RefundID: " + refundId);
            return refundId;
        }

        public boolean isConnected() {
            return true; // Stub always connected
        }
    }
}