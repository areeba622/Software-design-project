package com.palette.palette.patterns.adapter;

import java.util.UUID;

/**
 * ADAPTEE — stands in for Stripe's SDK. Its interface doesn't fit ours: it
 * charges whole US cents, not rupees. Simulated: no money moves and it always succeeds.
 */
public class StripeApi {

    /** @return a transaction id such as {@code stripe_3f2a...} */
    public String chargeInCents(int cents) {
        if (cents <= 0) {
            throw new IllegalArgumentException("Stripe charge must be at least 1 cent");
        }
        return "stripe_" + UUID.randomUUID();
    }
}
