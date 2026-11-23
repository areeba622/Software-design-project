package com.palette.palette.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.palette.palette.patterns.composite.InventoryItem;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product implements InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "price_pkr", nullable = false)
    private Double priceInPKR;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private RoomType roomType;

    // ── UPDATED: Aesthetic Style (BOHEMIAN, SCANDINAVIAN, MINIMALIST) ────────
    @Enumerated(EnumType.STRING)
    private Style aestheticStyle;

    private String vendorName;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "bundle_id")
    private FurnitureBundle bundle;

    // ── Enums ─────────────────────────────────────────────────────────────────

    public enum ProductCategory {
        BED, CHAIR, TABLE, LAMP, RUG, WARDROBE, SOFA,
        FLOORING, WALLPAPER, DECOR, OTHER
    }

    public enum RoomType {
        BEDROOM, LIVING_ROOM, KITCHEN, DINING_ROOM, GAME_ROOM, OFFICE
    }

    // ✅ UPDATED ENUM
    /** A product's look. (Not to be confused with the AestheticStyle entity, which describes a style.) */
    public enum Style {
        BOHEMIAN, SCANDINAVIAN, MINIMALIST
    }

    // ── Constructors ──────────────────────────────────────────────────────────

    public Product() {
    }

    public Product(String name, Double priceInPKR, ProductCategory category, RoomType roomType) {
        this.name = name;
        this.priceInPKR = priceInPKR;
        this.category = category;
        this.roomType = roomType;
    }

    public Product(String name, Double priceInPKR, ProductCategory category, 
                   RoomType roomType, Style aestheticStyle) {
        this.name = name;
        this.priceInPKR = priceInPKR;
        this.category = category;
        this.roomType = roomType;
        this.aestheticStyle = aestheticStyle;
    }

    // ── InventoryItem Contract ────────────────────────────────────────────────

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public double getPrice() {
        return priceInPKR != null ? priceInPKR : 0.0;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPriceInPKR() {
        return priceInPKR;
    }

    public void setPriceInPKR(Double priceInPKR) {
        this.priceInPKR = priceInPKR;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public Style getAestheticStyle() {
        return aestheticStyle;
    }

    public void setAestheticStyle(Style aestheticStyle) {
        this.aestheticStyle = aestheticStyle;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public FurnitureBundle getBundle() {
        return bundle;
    }

    public void setBundle(FurnitureBundle bundle) {
        this.bundle = bundle;
    }

    // ── equals & hashCode ─────────────────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return id != null && id.equals(product.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", priceInPKR=" + priceInPKR +
                ", category=" + category +
                ", roomType=" + roomType +
                ", aestheticStyle=" + aestheticStyle +
                '}';
    }
}