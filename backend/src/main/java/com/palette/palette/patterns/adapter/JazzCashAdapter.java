package com.palette.palette.patterns.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ADAPTER — lets Palette pay in PKR through {@link JazzCashApi}, which wants paisa.
 * Conversion: PKR × 100, rounded.
 */
public class JazzCashAdapter implements LocalPaymentProcessor {

    private static final Logger log = LoggerFactory.getLogger(JazzCashAdapter.class);

    private final JazzCashApi jazzCash;

    public JazzCashAdapter() {
        this(new JazzCashApi());
    }

    public JazzCashAdapter(JazzCashApi jazzCash) {
        this.jazzCash = jazzCash;
    }

    @Override
    public String payInPKR(double amountInPKR) {
        long paisa = Math.round(amountInPKR * 100);
        log.debug("JazzCash: PKR {} -> {} paisa", amountInPKR, paisa);
        return jazzCash.chargeInPaisa(paisa);
    }

    @Override
    public String getGatewayType() {
        return "JAZZCASH";
    }
}
