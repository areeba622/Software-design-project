package com.palette.palette.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType itemType;

    // Polymorphic references — only one is non-null at a time
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "bundle_id")
    private FurnitureBundle bundle;

    @ManyToOne
    @JoinColumn(name = "custom_room_id")
    private CustomRoom customRoom;

    @ManyToOne
    @JoinColumn(name = "designer_id")
    private Designer designer;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(nullable = false)
    private Double unitPrice = 0.0;

    public enum ItemType {
        PRODUCT, BUNDLE, CUSTOM_ROOM, DESIGNER_HIRE
    }

    // ── Constructors ──────────────────────────────────────────────────────────
    public CartItem() {}

    public CartItem(Cart cart, ItemType itemType, Integer quantity, Double unitPrice) {
        this.cart = cart;
        this.itemType = itemType;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    // ── Line total calculation ────────────────────────────────────────────────
    public double getLineTotal() {
        return unitPrice * quantity;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }

    public ItemType getItemType() { return itemType; }
    public void setItemType(ItemType itemType) { this.itemType = itemType; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public FurnitureBundle getBundle() { return bundle; }
    public void setBundle(FurnitureBundle bundle) { this.bundle = bundle; }

    public CustomRoom getCustomRoom() { return customRoom; }
    public void setCustomRoom(CustomRoom customRoom) { this.customRoom = customRoom; }

    public Designer getDesigner() { return designer; }
    public void setDesigner(Designer designer) { this.designer = designer; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    // ── equals & hashCode ─────────────────────────────────────────────────────
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItem cartItem = (CartItem) o;
        return id != null && id.equals(cartItem.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "CartItem{" +
                "id=" + id +
                ", itemType=" + itemType +
                ", quantity=" + quantity +
                ", unitPrice=" + unitPrice +
                ", lineTotal=" + getLineTotal() +
                '}';
    }
}