package com.palette.palette.services;

import com.palette.palette.dto.AuthResponseDTO;
import com.palette.palette.dto.LoginRequestDTO;
import com.palette.palette.dto.RegisterRequestDTO;
import com.palette.palette.entities.Cart;
import com.palette.palette.entities.User;
import com.palette.palette.repository.CartRepository;
import com.palette.palette.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository       userRepository;
    private final CartRepository       cartRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // ── Register ──────────────────────────────────────────────────────────────

    /**
     * Creates a new user account.
     * - Rejects duplicate emails immediately.
     * - Hashes the plain-text password with BCrypt before saving.
     * - Provisions an empty Cart right away so CartService never gets null.
     */
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO dto) {

        if (userRepository.existsByEmail(dto.getEmail())) {
            // Replaced with a standard Java built-in runtime exception
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // ❌ REMOVED User.builder() -> REPLACED with standard setters
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setCurrencyPreference(dto.getCurrencyPreference());

        userRepository.save(user);

        // Provision an empty Cart immediately
        Cart cart = new Cart();
        cart.setUser(user);
        cartRepository.save(cart);

        return new AuthResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getCurrencyPreference(),
                "Registration successful"
        );
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * Validates credentials and returns the user's profile on success.
     * - Throws exception if email not found or password fails.
     */
    public AuthResponseDTO login(LoginRequestDTO dto) {

        // Replaced with standard IllegalArgumentException if user is missing
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account found for: " + dto.getEmail()));

        // Replaced with standard IllegalArgumentException for wrong password
        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect password.");
        }

        return new AuthResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getCurrencyPreference(),
                "Login successful"
        );
    }
}