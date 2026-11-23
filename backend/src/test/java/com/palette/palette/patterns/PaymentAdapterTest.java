package com.palette.palette.patterns;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

import com.palette.palette.patterns.adapter.JazzCashAdapter;
import com.palette.palette.patterns.adapter.JazzCashApi;
import com.palette.palette.patterns.adapter.LocalPaymentProcessor;
import com.palette.palette.patterns.adapter.StripeAdapter;
import com.palette.palette.patterns.adapter.StripeApi;
import com.palette.palette.patterns.singleton.PaymentManager;

/** Adapter pattern + Singleton pattern. */
class PaymentAdapterTest {

    /** Fake adaptees that record what they were asked to charge. */
    static class RecordingStripeSdk extends StripeApi {
        int chargedCents = -1;

        @Override
        public String chargeInCents(int cents) {
            chargedCents = cents;
            return "stripe_test";
        }
    }

    static class RecordingJazzCashSdk extends JazzCashApi {
        long chargedPaisa = -1;

        @Override
        public String chargeInPaisa(long paisa) {
            chargedPaisa = paisa;
            return "jazzcash_test";
        }
    }

    @Test
    void stripeAdapterConvertsRupeesToUsdCents() {
        RecordingStripeSdk sdk = new RecordingStripeSdk();
        LocalPaymentProcessor stripe = new StripeAdapter(sdk);

        String txId = stripe.payInPKR(2_800); // 2,800 PKR = 10 USD at 280 PKR/USD

        assertThat(sdk.chargedCents).isEqualTo(1_000);
        assertThat(txId).isEqualTo("stripe_test");
        assertThat(stripe.getGatewayType()).isEqualTo("STRIPE");
    }

    @Test
    void stripeAdapterRoundsToTheNearestCent() {
        RecordingStripeSdk sdk = new RecordingStripeSdk();

        new StripeAdapter(sdk).payInPKR(100); // 0.357... USD

        assertThat(sdk.chargedCents).isEqualTo(36);
    }

    @Test
    void jazzCashAdapterConvertsRupeesToPaisa() {
        RecordingJazzCashSdk sdk = new RecordingJazzCashSdk();
        LocalPaymentProcessor jazzCash = new JazzCashAdapter(sdk);

        String txId = jazzCash.payInPKR(1_234.56);

        assertThat(sdk.chargedPaisa).isEqualTo(123_456);
        assertThat(txId).isEqualTo("jazzcash_test");
        assertThat(jazzCash.getGatewayType()).isEqualTo("JAZZCASH");
    }

    @Test
    void paymentManagerIsASingleton() {
        assertThat(PaymentManager.getInstance()).isSameAs(PaymentManager.getInstance());
    }

    @Test
    void paymentManagerRoutesToTheRightGateway() {
        PaymentManager manager = PaymentManager.getInstance();

        assertThat(manager.processOrder("stripe", 5_000)).startsWith("stripe_");
        assertThat(manager.processOrder("JAZZCASH", 5_000)).startsWith("jazzcash_");
    }

    @Test
    void paymentManagerUsesACustomAdapterWhenGivenOne() {
        RecordingJazzCashSdk sdk = new RecordingJazzCashSdk();

        PaymentManager.getInstance().processOrder(new JazzCashAdapter(sdk), 10);

        assertThat(sdk.chargedPaisa).isEqualTo(1_000);
    }

    @Test
    void paymentManagerRejectsBadInput() {
        PaymentManager manager = PaymentManager.getInstance();

        assertThatThrownBy(() -> manager.processOrder("PAYPAL", 5_000)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> manager.processOrder("ALFABANK", 5_000)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> manager.processOrder((String) null, 5_000)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> manager.processOrder("STRIPE", 0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> manager.processOrder("STRIPE", -1)).isInstanceOf(IllegalArgumentException.class);
    }
}
