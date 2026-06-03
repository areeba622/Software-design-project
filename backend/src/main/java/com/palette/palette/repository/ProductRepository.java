package com.palette.palette.repository;

import com.palette.palette.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find all products belonging to a specific bundle
    List<Product> findByBundleId(Long bundleId);

    // Filter by category enum
    List<Product> findByCategory(Product.ProductCategory category);

    // Filter by max price — used for budget-aware browsing
    List<Product> findByPriceInPKRLessThanEqual(Double maxPrice);

    // Keyword search on product name (case-insensitive)
    List<Product> findByNameContainingIgnoreCase(String keyword);

    // Find all standalone products (not assigned to any bundle)
    List<Product> findByBundleIsNull();

    // Vendor-based lookup for Adapter pattern use
    List<Product> findByVendorName(String vendorName);
}