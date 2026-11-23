package com.palette.palette.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.palette.palette.dto.OrderResponseDTO;
import com.palette.palette.dto.OrderResponseDTO.OrderLineDTO;
import com.palette.palette.entities.Cart;
import com.palette.palette.entities.Order;
import com.palette.palette.entities.OrderItem;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.repository.CartRepository;
import com.palette.palette.repository.OrderItemRepository;
import com.palette.palette.repository.OrderRepository;
import com.palette.palette.services.CartManager.PricedLine;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartManager cartManager;

    /**
     * Checkout: turns the user's cart into a PENDING order and empties the cart.
     * Each order line is a snapshot (name and price at the moment of checkout),
     * so order history stays correct even if a product changes later.
     * The cart row is locked while this runs, so a double-click can't create two orders.
     */
    @Transactional
    public OrderResponseDTO createOrderFromCart(Long userId) {
        Long cartId = cartManager.getOrCreateCart(userId).getId();
        Cart cart = cartRepository.findByIdForUpdate(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user " + userId));

        List<PricedLine> lines = cartManager.priceLines(cart);
        if (lines.isEmpty()) {
            throw new IllegalArgumentException("Your cart is empty.");
        }

        Order order = new Order();
        order.setUser(cart.getUser());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setGrandTotal(lines.stream().mapToDouble(PricedLine::lineTotal).sum());
        Order saved = orderRepository.save(order);

        List<OrderItem> items = lines.stream().map(line -> {
            OrderItem item = new OrderItem();
            item.setOrder(saved);
            item.setItemType(OrderItem.ItemType.valueOf(line.line().getItemType().name()));
            item.setItemName(line.item().getName());
            item.setQuantity(line.line().getQuantity());
            item.setUnitPrice(line.unitPrice());
            item.setLineTotal(line.lineTotal());
            return item;
        }).toList();
        orderItemRepository.saveAll(items);

        cart.getItems().clear();
        return toResponse(saved, items);
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return toResponse(order, orderItemRepository.findByOrderId(orderId));
    }

    /** The user's orders, newest first. */
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(order -> toResponse(order, orderItemRepository.findByOrderId(order.getId())))
                .toList();
    }

    private static OrderResponseDTO toResponse(Order order, List<OrderItem> items) {
        OrderResponseDTO dto = new OrderResponseDTO(
                order.getId(),
                order.getUser().getId(),
                order.getStatus(),
                order.getGrandTotal(),
                order.getCreatedAt());
        dto.setItems(items.stream()
                .map(item -> new OrderLineDTO(
                        item.getId(),
                        item.getItemType().name(),
                        item.getItemName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getLineTotal()))
                .toList());
        return dto;
    }
}
