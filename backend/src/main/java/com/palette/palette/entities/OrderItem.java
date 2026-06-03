package com.palette.palette.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Immutable snapshots — copied from CartItem at order time
    // These never change, even if the original Product is deleted
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType itemType;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(nullable = false)
    private Double unitPrice = 0.0;

    @Column(nullable = false)
    private Double lineTotal = 0.0;

    public enum ItemType {
        PRODUCT, BUNDLE, CUSTOM_ROOM, DESIGNER_HIRE
    }

    // ── Constructors ──────────────────────────────────────────────────────────
    public OrderItem() {}

    public OrderItem(Order order, ItemType itemType, String itemName, 
                     Integer quantity, Double unitPrice) {
        this.order = order;
        this.itemType = itemType;
        this.itemName = itemName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.lineTotal = unitPrice * quantity;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public ItemType getItemType() { return itemType; }
    public void setItemType(ItemType itemType) { this.itemType = itemType; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getLineTotal() { return lineTotal; }
    public void setLineTotal(Double lineTotal) { this.lineTotal = lineTotal; }

    // ── equals & hashCode ─────────────────────────────────────────────────────
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderItem orderItem = (OrderItem) o;
        return id != null && id.equals(orderItem.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "OrderItem{" +
                "id=" + id +
                ", itemType=" + itemType +
                ", itemName='" + itemName + '\'' +
                ", quantity=" + quantity +
                ", lineTotal=" + lineTotal +
                '}';
    }
}