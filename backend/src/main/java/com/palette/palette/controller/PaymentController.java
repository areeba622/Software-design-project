package com.palette.palette.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.PaymentRequestDTO;
import com.palette.palette.dto.PaymentResponseDTO;
import com.palette.palette.security.CurrentUserId;
import com.palette.palette.services.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /** 201 when the charge succeeds; 402 Payment Required (with the reason) when it fails. */
    @PostMapping("/process")
    public ResponseEntity<PaymentResponseDTO> processPayment(@CurrentUserId Long userId,
                                                             @Valid @RequestBody PaymentRequestDTO dto) {
        PaymentResponseDTO response = paymentService.processPayment(userId, dto);
        HttpStatus status = "SUCCESS".equals(response.getStatus()) ? HttpStatus.CREATED : HttpStatus.PAYMENT_REQUIRED;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/order/{orderId}")
    public PaymentResponseDTO getPaymentByOrderId(@CurrentUserId Long userId, @PathVariable Long orderId) {
        return paymentService.getPaymentByOrderId(orderId, userId);
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "Payment service is operational.";
    }
}
