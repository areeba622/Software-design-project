package com.palette.palette.repository;

import com.palette.palette.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // Load all line items for a given cart
    List<CartItem> findByCartId(Long cartId);

    // Check if a specific item already exists in the cart (avoid duplicates)
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    Optional<CartItem> findByCartIdAndBundleId(Long cartId, Long bundleId);

    Optional<CartItem> findByCartIdAndCustomRoomId(Long cartId, Long customRoomId);

    // Wipe all items when cart is cleared post-checkout

    void deleteByCartId(Long cartId);
}