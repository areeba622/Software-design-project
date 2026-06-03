package com.palette.palette.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.AuthResponseDTO;
import com.palette.palette.dto.LoginRequestDTO;
import com.palette.palette.dto.RegisterRequestDTO;
import com.palette.palette.services.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     *
     * Request body:
     * {
     *   "fullName":           "Ali Hassan",
     *   "email":              "ali@example.com",
     *   "password":           "secret123",
     *   "currencyPreference": "PKR"        // or "USD"
     * }
     *
     * Response 201:
     * {
     *   "userId":             1,
     *   "email":              "ali@example.com",
     *   "fullName":           "Ali Hassan",
     *   "currencyPreference": "PKR",
     *   "message":            "Registration successful"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(
            @Valid @RequestBody RegisterRequestDTO dto) {

        AuthResponseDTO response = authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     *
     * Request body:
     * {
     *   "email":    "ali@example.com",
     *   "password": "secret123"
     * }
     *
     * Response 200:
     * {
     *   "userId":             1,
     *   "email":              "ali@example.com",
     *   "fullName":           "Ali Hassan",
     *   "currencyPreference": "PKR",
     *   "message":            "Login successful"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO dto) {

        AuthResponseDTO response = authService.login(dto);
        return ResponseEntity.ok(response);
    }
}