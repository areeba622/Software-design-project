// src/main/java/com/palette/palette/repository/ProductRepository.java

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
    List<Product> findByBundleIsNull();
    List<Product> findByVendorName(String vendorName);

    // ── Layer 2: Quiz & Room Filtering ────────────────────────────────────────
    List<Product> findByRoomType(Product.RoomType roomType);
    List<Product> findByAestheticStyle(Product.AestheticStyle aestheticStyle);
    
    // ✅ NEW: Combine room type + aesthetic style for room builder
    List<Product> findByRoomTypeAndAestheticStyle(Product.RoomType roomType, 
                                                   Product.AestheticStyle aestheticStyle);
    
    // ✅ NEW: Get all products by room type (all styles mixed)
    List<Product> findByRoomTypeOrderByAestheticStyleAscNameAsc(Product.RoomType roomType);


}

