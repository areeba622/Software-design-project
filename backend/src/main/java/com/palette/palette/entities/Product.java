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

    @Column(nullable = false)
    private Double priceInPKR;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private ProductCategory category;

    private String vendorName;
    private String vendorModelCode;

    @JsonBackReference //new
    @ManyToOne
    @JoinColumn(name = "bundle_id")
    private FurnitureBundle bundle;

    public enum ProductCategory {
        BED, CHAIR, TABLE, LAMP, RUG, WARDROBE, SOFA,
        FLOORING, WALLPAPER, DECOR, OTHER
    }

    // ── Constructors ──────────────────────────────────────────────────────────
    public Product() {}

    public Product(String name, Double priceInPKR, ProductCategory category) {
        this.name = name;
        this.priceInPKR = priceInPKR;
        this.category = category;
    }

    // ── InventoryItem contract (Composite leaf) ──────────────────────────────
    @Override
    public Long getId() { return id; }

    @Override
    public String getName() { return name; }

    @Override
    public double getPrice() {
        return priceInPKR != null ? priceInPKR : 0.0;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public void setId(Long id) { this.id = id; }

    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPriceInPKR() { return priceInPKR; }
    public void setPriceInPKR(Double priceInPKR) { this.priceInPKR = priceInPKR; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public ProductCategory getCategory() { return category; }
    public void setCategory(ProductCategory category) { this.category = category; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorModelCode() { return vendorModelCode; }
    public void setVendorModelCode(String vendorModelCode) { this.vendorModelCode = vendorModelCode; }

    public FurnitureBundle getBundle() { return bundle; }
    public void setBundle(FurnitureBundle bundle) { this.bundle = bundle; }

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
                '}';
    }
}