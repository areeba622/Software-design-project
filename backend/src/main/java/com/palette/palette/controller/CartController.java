package com.palette.palette.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.CartItemRequestDTO;
import com.palette.palette.dto.CartResponseDTO;
import com.palette.palette.security.CurrentUserId;
import com.palette.palette.services.CartManager;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** The logged-in user's cart. Every endpoint returns the updated cart. */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartManager cartManager;

    @GetMapping
    public CartResponseDTO getCart(@CurrentUserId Long userId) {
        return cartManager.getCartSummary(userId);
    }

    @PostMapping("/add")
    public CartResponseDTO addItemToCart(@CurrentUserId Long userId,
                                         @Valid @RequestBody CartItemRequestDTO dto) {
        return cartManager.addItemToCart(userId, dto);
    }

    @DeleteMapping("/remove/{cartItemId}")
    public CartResponseDTO removeItem(@CurrentUserId Long userId, @PathVariable Long cartItemId) {
        return cartManager.removeItemFromCart(userId, cartItemId);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@CurrentUserId Long userId) {
        cartManager.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
