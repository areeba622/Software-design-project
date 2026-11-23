package com.palette.palette.services;

import java.util.Locale;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.palette.palette.dto.AuthResponseDTO;
import com.palette.palette.dto.LoginRequestDTO;
import com.palette.palette.dto.RegisterRequestDTO;
import com.palette.palette.entities.Cart;
import com.palette.palette.entities.User;
import com.palette.palette.exceptions.InvalidCredentialsException;
import com.palette.palette.repository.CartRepository;
import com.palette.palette.repository.UserRepository;
import com.palette.palette.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Creates an account (password stored as a BCrypt hash), gives it an empty
     * cart, and logs the user straight in.
     */
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        String email = normalizeEmail(dto.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = new User();
        user.setFullName(dto.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setCurrencyPreference(dto.getCurrencyPreference());
        userRepository.save(user);

        cartRepository.save(new Cart(user));

        return toResponse(user, "Registration successful");
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(normalizeEmail(dto.getEmail()))
                .filter(u -> passwordEncoder.matches(dto.getPassword(), u.getPasswordHash()))
                .orElseThrow(InvalidCredentialsException::new);

        return toResponse(user, "Login successful");
    }

    private AuthResponseDTO toResponse(User user, String message) {
        return new AuthResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getCurrencyPreference(),
                jwtService.issueToken(user),
                message);
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
