package com.palette.palette.entities;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.palette.palette.patterns.composite.InventoryItem;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "furniture_bundles")
public class FurnitureBundle implements InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType roomType;

    @ManyToOne
    @JoinColumn(name = "style_id", nullable = false)
    private AestheticStyle style;

    @JsonManagedReference
    @OneToMany(mappedBy = "bundle", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Product> products = new ArrayList<>();

    @Column(nullable = false)
    private Double discountFactor = 1.0;

    @Column(nullable = false)
    private Double totalPriceInPKR = 0.0;

    public enum RoomType {
        BEDROOM, LIVING_ROOM, GAME_ROOM, KITCHEN, DINING_ROOM, OFFICE
    }

    // ── Constructors ──────────────────────────────────────────────────────────
    public FurnitureBundle() {}

    public FurnitureBundle(String name, RoomType roomType, AestheticStyle style) {
        this.name = name;
        this.roomType = roomType;
        this.style = style;
    }

    // ── InventoryItem contract (Composite node) ──────────────────────────────
    @Override
    public Long getId() { return id; }

    @Override
    public String getName() { return name; }

    @Override
    public double getPrice() {
        if (products == null || products.isEmpty()) {
            return 0.0;
        }
        double rawTotal = 0.0;
        for (Product p : products) {
            rawTotal += p.getPrice();
        }
        return rawTotal * (discountFactor != null ? discountFactor : 1.0);
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public void setId(Long id) { this.id = id; }

    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public RoomType getRoomType() { return roomType; }
    public void setRoomType(RoomType roomType) { this.roomType = roomType; }

    public AestheticStyle getStyle() { return style; }
    public void setStyle(AestheticStyle style) { this.style = style; }

    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }

    public Double getDiscountFactor() { return discountFactor; }
    public void setDiscountFactor(Double discountFactor) { this.discountFactor = discountFactor; }

    public Double getTotalPriceInPKR() { return totalPriceInPKR; }
    public void setTotalPriceInPKR(Double totalPriceInPKR) { this.totalPriceInPKR = totalPriceInPKR; }

    // ── equals & hashCode ─────────────────────────────────────────────────────
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FurnitureBundle that = (FurnitureBundle) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "FurnitureBundle{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", roomType=" + roomType +
                ", price=" + getPrice() +
                '}';
    }
}