package com.palette.palette.controller;

import com.palette.palette.dto.CartItemRequestDTO;
import com.palette.palette.dto.CartResponseDTO;
import com.palette.palette.services.CartManager;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartManager cartManager;

    // POST /api/cart/add?userId=1
    // Body: { "itemId": 3, "quantity": 2, "itemType": "PRODUCT" }
    @PostMapping("/add")
    public ResponseEntity<String> addItemToCart(
            @RequestParam Long userId,
            @Valid @RequestBody CartItemRequestDTO dto) {

        cartManager.addItemToCart(userId, dto);
        return ResponseEntity.ok("Item added to cart successfully.");
    }

    // GET /api/cart?userId=1
    // Returns full cart snapshot with composite-calculated totals
    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(@RequestParam Long userId) {
        CartResponseDTO summary = cartManager.getCartSummary(userId);
        return ResponseEntity.ok(summary);
    }

    // DELETE /api/cart/remove/{cartItemId}?userId=1
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<String> removeItem(
            @PathVariable Long cartItemId,
            @RequestParam Long userId) {

        cartManager.removeItemFromCart(userId, cartItemId);
        return ResponseEntity.ok("Item removed from cart.");
    }

    // DELETE /api/cart/clear?userId=1
    // Called internally after order is placed
    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart(@RequestParam Long userId) {
        cartManager.clearCart(userId);
        return ResponseEntity.ok("Cart cleared.");
    }
}