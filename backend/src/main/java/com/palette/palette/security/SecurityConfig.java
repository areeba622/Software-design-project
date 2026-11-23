package com.palette.palette.security;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Stateless JWT security.
 * Browsing (products, designers, the style quiz) is public; anything tied to a
 * user — cart, orders, payments, saved rooms — needs a valid login token.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public JwtDecoder jwtDecoder(@Value("${palette.jwt.secret}") String secret) {
        return NimbusJwtDecoder.withSecretKey(JwtService.secretKey(secret))
                .macAlgorithm(JwtService.ALGORITHM)
                .build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, ObjectMapper objectMapper) throws Exception {
        http
            .csrf(csrf -> csrf.disable())          // no cookies/sessions, so no CSRF risk
            .cors(Customizer.withDefaults())       // uses CorsConfig
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET,
                        "/api/products/**",
                        "/api/designers/**",
                        "/api/room-builder/products/**",
                        "/api/payment/health").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/design-quiz/submit").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth -> oauth
                .jwt(Customizer.withDefaults())
                .authenticationEntryPoint((request, response, ex) ->
                        writeError(response, objectMapper, HttpStatus.UNAUTHORIZED,
                                "Your session has expired or is invalid. Please log in again.")))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, e) ->
                        writeError(response, objectMapper, HttpStatus.UNAUTHORIZED, "You need to log in first."))
                .accessDeniedHandler((request, response, e) ->
                        writeError(response, objectMapper, HttpStatus.FORBIDDEN, "You are not allowed to do that.")));

        return http.build();
    }

    /** Same JSON error shape as {@link com.palette.palette.exceptions.GlobalExceptionHandler}. */
    private static void writeError(HttpServletResponse response, ObjectMapper mapper,
                                   HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(), Map.of(
                "timestamp", Instant.now().toString(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message));
    }
}
