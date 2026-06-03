package com.palette.palette.patterns.adapter;

import java.util.UUID;

/**
 * Adapter: Processes PKR payments directly through JazzCash.
 * JazzCash accepts: amount in paisa (1 PKR = 100 paisa), currency = PKR.
 * Conversion: PKR → paisa (×100)
 */
public class JazzCashAdapter implements LocalPaymentProcessor {

    private final JazzCashSDK jazzCashSDK;

    // Constructors
    public JazzCashAdapter() {
        this.jazzCashSDK = new JazzCashSDK();
    }

    public JazzCashAdapter(JazzCashSDK jazzCashSDK) {
        this.jazzCashSDK = jazzCashSDK;
    }

    @Override
    public String payInPKR(double amountInPKR) {

        // Step 1: Convert PKR to paisa (1 PKR = 100 paisa)
        long amountInPaisa = (long) Math.round(amountInPKR * 100);

        // Step 2: Call JazzCash SDK
        System.out.println("JazzCashAdapter: Converting PKR " + amountInPKR +
                " to paisa " + amountInPaisa);

        return jazzCashSDK.chargeInPaisa(amountInPaisa);
    }

    @Override
    public String getGatewayType() {
        return "JAZZCASH";
    }

    public long convertPKRToPaisa(double amountInPKR) {
        return (long) Math.round(amountInPKR * 100);
    }

    // ── Inner Stub: JazzCashSDK ──────────────────────────────────────────

    /**
     * Stub implementation of JazzCash SDK.
     * In production, this would call actual JazzCash API.
     */
    public static class JazzCashSDK {

        private String apiKey = "jazzcash_test_key_12345";
        private String accountId = "PALETTE123";

        public String chargeInPaisa(long paisa) {
            // Simulate JazzCash charge
            String transactionId = "jazzcash_" + UUID.randomUUID().toString();
            double amountInPKR = paisa / 100.0;
            System.out.println("JazzCashSDK: Charged " + paisa + " paisa (PKR " + amountInPKR +
                    "). TxID: " + transactionId);
            return transactionId;
        }

        public String refund(String transactionId, long refundPaisa) {
            String refundId = "jz_refund_" + UUID.randomUUID().toString();
            double amountInPKR = refundPaisa / 100.0;
            System.out.println("JazzCashSDK: Refunded " + refundPaisa + " paisa (PKR " +
                    amountInPKR + ") for TxID: " + transactionId + ". RefundID: " + refundId);
            return refundId;
        }

        public boolean authenticate(String apiKey) {
            return apiKey != null && apiKey.equals(this.apiKey);
        }

        public boolean isConnected() {
            return true; // Stub always connected
        }

        // Getters
        public String getApiKey() {
            return apiKey;
        }

        public String getAccountId() {
            return accountId;
        }

        // Setters
        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public void setAccountId(String accountId) {
            this.accountId = accountId;
        }
    }
}