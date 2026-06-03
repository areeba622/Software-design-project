package com.palette.palette.services;

import com.palette.palette.entities.FurnitureBundle;
import com.palette.palette.entities.Product;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.repository.FurnitureBundleRepository;
import com.palette.palette.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ECommerceService {

    private final ProductRepository productRepository;
    private final FurnitureBundleRepository bundleRepository;

    // ── Product Catalog ────────────────────────────────────────────────────────

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));
    }

    public List<Product> getProductsByCategory(String categoryStr) {
        try {
            Product.ProductCategory category =
                    Product.ProductCategory.valueOf(categoryStr.toUpperCase());
            return productRepository.findByCategory(category);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException(
                    "Invalid product category: " + categoryStr);
        }
    }

    public List<Product> searchProductsByKeyword(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    public List<Product> getProductsByMaxPrice(Double maxPrice) {
        return productRepository.findByPriceInPKRLessThanEqual(maxPrice);
    }

    public List<Product> getStandaloneProducts() {
        return productRepository.findByBundleIsNull();
    }

    // ── Bundle Catalog ─────────────────────────────────────────────────────────

    public List<FurnitureBundle> getAllBundles() {
        return bundleRepository.findAll();
    }

    public FurnitureBundle getBundleById(Long id) {
        return bundleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Bundle not found with id: " + id));
    }

    public List<FurnitureBundle> getBundlesByRoomType(String roomTypeStr) {
        try {
            FurnitureBundle.RoomType roomType =
                    FurnitureBundle.RoomType.valueOf(roomTypeStr.toUpperCase());
            return bundleRepository.findByRoomType(roomType);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException(
                    "Invalid room type: " + roomTypeStr);
        }
    }

    public List<FurnitureBundle> getBundlesByMaxPrice(Double maxPrice) {
        return bundleRepository.findByTotalPriceInPKRLessThanEqual(maxPrice);
    }
}