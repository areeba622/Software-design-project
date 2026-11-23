package com.palette.palette.services;

import java.util.UUID;

import com.palette.palette.dto.AuthResponseDTO;
import com.palette.palette.dto.RegisterRequestDTO;
import com.palette.palette.entities.User.CurrencyPreference;

/** Creates throwaway accounts for tests. */
public final class TestUsers {

    public static final String PASSWORD = "secret123";

    private TestUsers() {
    }

    public static RegisterRequestDTO newRegistration() {
        RegisterRequestDTO dto = new RegisterRequestDTO();
        dto.setFullName("Test Shopper");
        dto.setEmail("shopper-" + UUID.randomUUID() + "@example.com");
        dto.setPassword(PASSWORD);
        dto.setCurrencyPreference(CurrencyPreference.PKR);
        return dto;
    }

    public static AuthResponseDTO register(AuthService authService) {
        return authService.register(newRegistration());
    }
}
