package com.palette.palette.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.palette.palette.dto.OrderRequestDTO;
import com.palette.palette.dto.OrderResponseDTO;
import com.palette.palette.dto.OrderResponseDTO.OrderLineDTO;
import com.palette.palette.entities.Cart;
import com.palette.palette.entities.CartItem;
import com.palette.palette.entities.Order;
import com.palette.palette.entities.OrderItem;
import com.palette.palette.entities.User;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.repository.CartRepository;
import com.palette.palette.repository.OrderItemRepository;
import com.palette.palette.repository.OrderRepository;
import com.palette.palette.repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartRepository cartRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    // ── Create Order from Cart ─────────────────────────────────────────────────

    /**
     * Converts a cart into a finalized Order + OrderItems.
     * - Validates user and cart existence
     * - Calculates grand total from cart items
     * - Creates immutable OrderItem snapshots
     * - Clears the cart after checkout
     * - Returns OrderResponseDTO
     * 
     * Exceptions:
     * - ResourceNotFoundException (404): User or cart not found
     * - IllegalArgumentException (400): Validation failed (caught by GlobalExceptionHandler)
     */
    @Transactional
    public OrderResponseDTO createOrderFromCart(OrderRequestDTO dto) {

        // Validate user exists → 404
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + dto.getUserId()));

        // Validate cart exists → 404
        Cart cart = cartRepository.findByIdForUpdate(dto.getCartId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart not found with id: " + dto.getCartId()));

        // Validate cart belongs to user → 400 (caught by GlobalExceptionHandler)
        if (!cart.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "Cart does not belong to user: " + dto.getUserId());
        }

        // Validate cart is not empty → 400 (caught by GlobalExceptionHandler)
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException(
                    "Cannot create order from empty cart");
        }

        // Calculate grand total from cart
        double grandTotal = cart.getGrandTotal();

        // Create order entity
         Order order = new Order();
        order.setUser(user);
        order.setGrandTotal(grandTotal);
        order.setStatus(Order.OrderStatus.PENDING);
        Order savedOrder = orderRepository.save(order); 

       // Order order = new Order(user, grandTotal);

        // Create immutable OrderItem snapshots from CartItems
        // This preserves order history even if products are deleted
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setItemType(OrderItem.ItemType.valueOf(cartItem.getItemType().toString()));
            orderItem.setItemName(getItemName(cartItem));
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            orderItem.setLineTotal(cartItem.getLineTotal());

            OrderItem saved = orderItemRepository.save(orderItem);
            orderItems.add(saved);
        }

        // Clear cart for next purchase (user can now add new items)
        cart.getItems().clear();
        cartRepository.save(cart);

        // Build and return response
        return buildOrderResponse(savedOrder, orderItems);
    }

    // ── Get Order by ID (with user validation) ──────────────────────────────────

    /**
     * Retrieves a specific order if it belongs to the authenticated user.
     * 
     * @param orderId Order ID
     * @param userId Authenticated user ID (for access control)
     * @return OrderResponseDTO with order details
     * @throws ResourceNotFoundException (404) if order not found or doesn't belong to user
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + orderId + " for user: " + userId));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return buildOrderResponse(order, items);
    }

    // ── Get All Orders for User ────────────────────────────────────────────────

    /**
     * Retrieves all orders placed by a user.
     * 
     * @param userId User ID
     * @return List of OrderResponseDTO
     * @throws ResourceNotFoundException (404) if user not found
     */
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrders(Long userId) {
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));

        // Get all orders for this user
        List<Order> orders = orderRepository.findByUserId(userId);
        List<OrderResponseDTO> responses = new ArrayList<>();

        for (Order order : orders) {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
            responses.add(buildOrderResponse(order, items));
        }

        return responses;
    }

    // ── Get Order by ID (Admin - no user validation) ───────────────────────────

    /**
     * Admin endpoint: Retrieves any order without user validation.
     * 
     * @param orderId Order ID
     * @return OrderResponseDTO with order details
     * @throws ResourceNotFoundException (404) if order not found
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderByIdAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + orderId));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return buildOrderResponse(order, items);
    }

    // ── Update Order Status ────────────────────────────────────────────────────

    /**
     * Updates the status of an order.
     * Accepted statuses: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
     * 
     * @param orderId Order ID to update
     * @param newStatus New status (string, case-insensitive)
     * @return Updated OrderResponseDTO
     * @throws ResourceNotFoundException (404) if order not found
     * @throws IllegalArgumentException (400) if status is invalid (caught by GlobalExceptionHandler)
     */
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + orderId));

        // Validate and set status
        try {
            order.setStatus(Order.OrderStatus.valueOf(newStatus.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid status: " + newStatus + 
                    ". Accepted values: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED");
        }

        orderRepository.save(order);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return buildOrderResponse(order, items);
    }

    // ── Private Helper Methods ─────────────────────────────────────────────────

    /**
     * Extracts the item name from a CartItem (polymorphic).
     * Handles: Product, FurnitureBundle, CustomRoom, Designer
     * 
     * @param cartItem CartItem with polymorphic item references
     * @return String name of the item
     */
    private String getItemName(CartItem cartItem) {
        if (cartItem.getProduct() != null) {
            return cartItem.getProduct().getName();
        } else if (cartItem.getBundle() != null) {
            return cartItem.getBundle().getName();
        } else if (cartItem.getCustomRoom() != null) {
            return "Custom Room: " + cartItem.getCustomRoom().getRoomType();
        } else if (cartItem.getDesigner() != null) {
            return "Designer: " + cartItem.getDesigner().getName();
        }
        return "Unknown Item";
    }

    /**
     * Builds OrderResponseDTO from Order entity and OrderItems list.
     * Converts OrderItems to OrderLineDTOs for response.
     * 
     * @param order Order entity
     * @param items List of OrderItems
     * @return OrderResponseDTO ready for API response
     */
    private OrderResponseDTO buildOrderResponse(Order order, List<OrderItem> items) {
        OrderResponseDTO dto = new OrderResponseDTO(
                order.getId(),
                order.getUser().getId(),
                order.getStatus(),
                order.getGrandTotal(),
                order.getCreatedAt()
        );

        // Convert OrderItems to line DTOs
        List<OrderLineDTO> lineDTOs = new ArrayList<>();
        for (OrderItem item : items) {
            OrderLineDTO lineDTO = new OrderLineDTO(
                    item.getId(),
                    item.getItemType().toString(),
                    item.getItemName(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getLineTotal()
            );
            lineDTOs.add(lineDTO);
        }
        dto.setItems(lineDTOs);

        return dto;
    }
}