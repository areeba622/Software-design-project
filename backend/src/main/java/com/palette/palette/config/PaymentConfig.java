package com.palette.palette.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.palette.palette.patterns.singleton.PaymentManager;

@Configuration
public class PaymentConfig {

    /**
     * Hands Spring the one real singleton, rather than letting Spring create a
     * second PaymentManager through reflection.
     */
    @Bean
    public PaymentManager paymentManager() {
        return PaymentManager.getInstance();
    }
}
