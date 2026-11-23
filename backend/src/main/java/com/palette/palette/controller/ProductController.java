package com.palette.palette.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.entities.FurnitureBundle;
import com.palette.palette.entities.Product;
import com.palette.palette.services.ECommerceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ECommerceService eCommerceService;

    // GET /api/products
    // Returns full product catalog
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(eCommerceService.getAllProducts());
    }

    // GET /api/products/{id}
    // Returns single product or 404 via GlobalExceptionHandler
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(eCommerceService.getProductById(id));
    }

    // GET /api/products/category/{category}
    // e.g. /api/products/category/BED
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(eCommerceService.getProductsByCategory(category));
    }

    // GET /api/products/search?keyword=sofa
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String keyword) {
        return ResponseEntity.ok(eCommerceService.searchProductsByKeyword(keyword));
    }

    // GET /api/products/filter?maxPrice=50000
    @GetMapping("/filter")
    public ResponseEntity<List<Product>> filterByMaxPrice(
            @RequestParam Double maxPrice) {
        return ResponseEntity.ok(eCommerceService.getProductsByMaxPrice(maxPrice));
    }

    // GET /api/products/standalone
    // Products not assigned to any bundle — for individual purchase
    @GetMapping("/standalone")
    public ResponseEntity<List<Product>> getStandaloneProducts() {
        return ResponseEntity.ok(eCommerceService.getStandaloneProducts());
    }

    // ── Bundle Endpoints (exposed here for catalog browsing convenience) ───────

    // GET /api/products/bundles
    @GetMapping("/bundles")
    public ResponseEntity<List<FurnitureBundle>> getAllBundles() {
        return ResponseEntity.ok(eCommerceService.getAllBundles());
    }

    // GET /api/products/bundles/{id}
    @GetMapping("/bundles/{id}")
    public ResponseEntity<FurnitureBundle> getBundleById(@PathVariable Long id) {
        return ResponseEntity.ok(eCommerceService.getBundleById(id));
    }

    // GET /api/products/bundles/room/{roomType}
    // e.g. /api/products/bundles/room/BEDROOM
    @GetMapping("/bundles/room/{roomType}")
    public ResponseEntity<List<FurnitureBundle>> getBundlesByRoomType(
            @PathVariable String roomType) {
        return ResponseEntity.ok(eCommerceService.getBundlesByRoomType(roomType));
    }

    // GET /api/products/bundles/filter?maxPrice=150000
    @GetMapping("/bundles/filter")
    public ResponseEntity<List<FurnitureBundle>> getBundlesByMaxPrice(
            @RequestParam Double maxPrice) {
        return ResponseEntity.ok(eCommerceService.getBundlesByMaxPrice(maxPrice));
    }
}