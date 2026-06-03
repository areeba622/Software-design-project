package com.palette.palette.repository;

import com.palette.palette.entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Find all items for a given order
    List<OrderItem> findByOrderId(Long orderId);
}