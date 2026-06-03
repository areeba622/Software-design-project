package com.palette.palette.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.palette.palette.entities.Order;

public class OrderResponseDTO {

    private Long orderId;
    private Long userId;
    private Order.OrderStatus status;
    private Double grandTotal;
    private LocalDateTime createdAt;
    private List<OrderLineDTO> items;

    public OrderResponseDTO() {}

    public OrderResponseDTO(Long orderId, Long userId, Order.OrderStatus status,
                            Double grandTotal, LocalDateTime createdAt) {
        this.orderId = orderId;
        this.userId = userId;
        this.status = status;
        this.grandTotal = grandTotal;
        this.createdAt = createdAt;
        this.items = new ArrayList<>();
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Order.OrderStatus getStatus() { return status; }
    public void setStatus(Order.OrderStatus status) { this.status = status; }

    public Double getGrandTotal() { return grandTotal; }
    public void setGrandTotal(Double grandTotal) { this.grandTotal = grandTotal; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<OrderLineDTO> getItems() { return items; }
    public void setItems(List<OrderLineDTO> items) { this.items = items; }

    // ── Nested OrderLineDTO ───────────────────────────────────────────────────
    public static class OrderLineDTO {
        private Long itemId;
        private String itemType;   // PRODUCT, BUNDLE, CUSTOM_ROOM, DESIGNER_HIRE
        private String itemName;
        private Integer quantity;
        private Double unitPrice;
        private Double lineTotal;

        public OrderLineDTO() {}

        public OrderLineDTO(Long itemId, String itemType, String itemName,
                            Integer quantity, Double unitPrice, Double lineTotal) {
            this.itemId = itemId;
            this.itemType = itemType;
            this.itemName = itemName;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.lineTotal = lineTotal;
        }

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public String getItemType() { return itemType; }
        public void setItemType(String itemType) { this.itemType = itemType; }

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Double getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

        public Double getLineTotal() { return lineTotal; }
        public void setLineTotal(Double lineTotal) { this.lineTotal = lineTotal; }

        @Override
        public String toString() {
            return "OrderLineDTO{" +
                    "itemName='" + itemName + '\'' +
                    ", quantity=" + quantity +
                    ", lineTotal=" + lineTotal +
                    '}';
        }
    }

    @Override
    public String toString() {
        return "OrderResponseDTO{" +
                "orderId=" + orderId +
                ", status=" + status +
                ", grandTotal=" + grandTotal +
                ", itemCount=" + (items != null ? items.size() : 0) +
                '}';
    }
}