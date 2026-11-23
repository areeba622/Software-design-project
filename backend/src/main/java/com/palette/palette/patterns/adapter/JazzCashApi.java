package com.palette.palette.patterns.adapter;

import java.util.UUID;

/**
 * ADAPTEE — stands in for JazzCash's SDK. It charges paisa (1 PKR = 100 paisa).
 * Simulated: no money moves and it always succeeds.
 */
public class JazzCashApi {

    /** @return a transaction id such as {@code jazzcash_3f2a...} */
    public String chargeInPaisa(long paisa) {
        if (paisa <= 0) {
            throw new IllegalArgumentException("JazzCash charge must be at least 1 paisa");
        }
        return "jazzcash_" + UUID.randomUUID();
    }
}
