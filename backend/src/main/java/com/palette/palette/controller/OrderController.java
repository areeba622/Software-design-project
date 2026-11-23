package com.palette.palette.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.OrderResponseDTO;
import com.palette.palette.security.CurrentUserId;
import com.palette.palette.services.OrderService;

import lombok.RequiredArgsConstructor;

/** The logged-in user's orders. */
@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** Checkout: creates a PENDING order from the user's cart and empties the cart. */
    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponseDTO createOrder(@CurrentUserId Long userId) {
        return orderService.createOrderFromCart(userId);
    }

    @GetMapping
    public List<OrderResponseDTO> getMyOrders(@CurrentUserId Long userId) {
        return orderService.getUserOrders(userId);
    }

    @GetMapping("/{orderId}")
    public OrderResponseDTO getOrder(@CurrentUserId Long userId, @PathVariable Long orderId) {
        return orderService.getOrderById(orderId, userId);
    }
}
