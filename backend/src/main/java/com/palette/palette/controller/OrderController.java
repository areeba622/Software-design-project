package com.palette.palette.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.OrderRequestDTO;
import com.palette.palette.dto.OrderResponseDTO;
import com.palette.palette.services.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ── Create Order from Cart ────────────────────────────────────────────────

    /**
     * POST /api/order/create
     *
     * Converts cart into finalized order.
     * Request body:
     * {
     *   "userId": 1,
     *   "cartId": 1
     * }
     *
     * Response 201:
     * {
     *   "orderId": 1,
     *   "userId": 1,
     *   "status": "PENDING",
     *   "grandTotal": 75000.0,
     *   "createdAt": "2026-06-03T...",
     *   "items": [
     *     {
     *       "itemId": 1,
     *       "itemType": "PRODUCT",
     *       "itemName": "King Bed",
     *       "quantity": 1,
     *       "unitPrice": 45000.0,
     *       "lineTotal": 45000.0
     *     }
     *   ]
     * }
     */
    @PostMapping("/create")
    public ResponseEntity<OrderResponseDTO> createOrder(
            @Valid @RequestBody OrderRequestDTO dto) {

        OrderResponseDTO response = orderService.createOrderFromCart(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── Get Order by ID (with user validation) ──────────────────────────────────

    /**
     * GET /api/order/{orderId}?userId=1
     *
     * Retrieves order details if it belongs to the user.
     * User must provide their userId as query parameter for access control.
     *
     * Response 200:
     * {
     *   "orderId": 1,
     *   "userId": 1,
     *   "status": "PENDING",
     *   "grandTotal": 75000.0,
     *   "createdAt": "2026-06-03T...",
     *   "items": [...]
     * }
     *
     * Response 404 if order not found or doesn't belong to user
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrder(
            @PathVariable Long orderId,
            @RequestParam Long userId) {

        OrderResponseDTO response = orderService.getOrderById(orderId, userId);
        return ResponseEntity.ok(response);
    }

    // ── Get All Orders for User ────────────────────────────────────────────────

    /**
     * GET /api/order/user/{userId}
     *
     * Returns all orders placed by the user.
     *
     * Response 200:
     * [
     *   {
     *     "orderId": 1,
     *     "userId": 1,
     *     "status": "PENDING",
     *     "grandTotal": 75000.0,
     *     "createdAt": "2026-06-03T...",
     *     "items": [...]
     *   },
     *   ...
     * ]
     *
     * Response 404 if user not found
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getUserOrders(
            @PathVariable Long userId) {

        List<OrderResponseDTO> responses = orderService.getUserOrders(userId);
        return ResponseEntity.ok(responses);
    }

    // ── Get Order by ID (admin endpoint - no user validation) ─────────────────

    /**
     * GET /api/order/admin/{orderId}
     *
     * Admin endpoint: retrieve any order without user validation.
     * In production, add @PreAuthorize("hasRole('ADMIN')")
     *
     * Response 200: OrderResponseDTO
     * Response 404 if order not found
     */
    @GetMapping("/admin/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderAdmin(
            @PathVariable Long orderId) {

        OrderResponseDTO response = orderService.getOrderByIdAdmin(orderId);
        return ResponseEntity.ok(response);
    }

    // ── Update Order Status ────────────────────────────────────────────────────

    /**
     * PATCH /api/order/{orderId}/status?newStatus=SHIPPED
     *
     * Updates order status.
     * Accepted values: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
     *
     * Response 200: OrderResponseDTO (updated)
     * Response 400 if invalid status
     * Response 404 if order not found
     */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String newStatus) {

        OrderResponseDTO response = orderService.updateOrderStatus(orderId, newStatus);
        return ResponseEntity.ok(response);
    }
}