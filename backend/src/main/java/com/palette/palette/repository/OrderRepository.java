package com.palette.palette.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.palette.palette.entities.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find all orders for a specific user
    List<Order> findByUserId(Long userId);

    // Find orders by user and status combination
    List<Order> findByUserIdAndStatus(Long userId, Order.OrderStatus status);

    // Find all orders with a specific status (e.g., all PENDING orders)
    List<Order> findByStatus(Order.OrderStatus status);

    // Find orders for a user, ordered by creation date descending (most recent first)
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Find a specific order and verify it belongs to a user
    Optional<Order> findByIdAndUserId(Long orderId, Long userId);

    // Count total orders for a user
    long countByUserId(Long userId);

    // Count orders by status (for reporting/analytics)
    long countByStatus(Order.OrderStatus status);
}