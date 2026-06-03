package com.palette.palette.patterns.adapter;

/**
 * Adapter interface: Unified contract for all payment gateways.
 * Converts all amounts to the gateway's native format internally.
 */
public interface LocalPaymentProcessor {

    /**
     * Process payment in PKR.
     * Implementation handles conversion to gateway's required format.
     *
     * @param amountInPKR amount in Pakistani Rupees
     * @return transaction ID from the gateway
     */
    String payInPKR(double amountInPKR);

    /**
     * Get the gateway type this processor handles.
     */
    String getGatewayType();
}