package com.palette.palette.patterns.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ADAPTER — lets Palette pay in PKR through {@link StripeApi}, which wants US cents.
 * Conversion: PKR → USD (÷ {@value #PKR_TO_USD_RATE}) → cents (× 100, rounded).
 */
public class StripeAdapter implements LocalPaymentProcessor {

    private static final Logger log = LoggerFactory.getLogger(StripeAdapter.class);

    /** Fixed demo exchange rate: 1 USD = 280 PKR. */
    public static final double PKR_TO_USD_RATE = 280.0;

    private final StripeApi stripe;

    public StripeAdapter() {
        this(new StripeApi());
    }

    public StripeAdapter(StripeApi stripe) {
        this.stripe = stripe;
    }

    @Override
    public String payInPKR(double amountInPKR) {
        int cents = (int) Math.round(convertPKRToUSD(amountInPKR) * 100);
        log.debug("Stripe: PKR {} -> {} US cents", amountInPKR, cents);
        return stripe.chargeInCents(cents);
    }

    @Override
    public String getGatewayType() {
        return "STRIPE";
    }

    public static double convertPKRToUSD(double amountInPKR) {
        return amountInPKR / PKR_TO_USD_RATE;
    }
}
