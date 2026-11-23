package com.palette.palette.dto;

import com.palette.palette.entities.User.CurrencyPreference;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Returned by login and register. The frontend stores {@code token} and sends
 * it as {@code Authorization: Bearer <token>} on every request that needs a user.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private Long userId;
    private String email;
    private String fullName;
    private CurrencyPreference currencyPreference;
    private String token;
    private String message;
}
