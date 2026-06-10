package com.palette.palette.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.palette.palette.entities.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ── Layer 1: E-Commerce ───────────────────────────────────────────────────
    List<Product> findByBundleId(Long bundleId);

    List<Product> findByCategory(Product.ProductCategory category);

    List<Product> findByPriceInPKRLessThanEqual(Double maxPrice);

    List<Product> findByNameContainingIgnoreCase(String keyword);

    List<Product> findByBundleIsNull(); // Standalone products

    List<Product> findByVendorName(String vendorName);

    // ── Layer 2: Quiz & Room Filtering ────────────────────────────────────────
    List<Product> findByRoomType(Product.RoomType roomType);  // ✅ NEW for Layer 2

    // ── Future: Style filtering ───────────────────────────────────────────────
    List<Product> findByAestheticStyle(Product.AestheticStyle aestheticStyle);

    // ── Advanced: Room + Style ────────────────────────────────────────────────
    List<Product> findByRoomTypeAndAestheticStyle(Product.RoomType roomType, 
                                                   Product.AestheticStyle aestheticStyle);
}