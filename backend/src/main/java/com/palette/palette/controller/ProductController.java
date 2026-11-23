package com.palette.palette.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.FurnitureBundleDTO;
import com.palette.palette.dto.ProductDTO;
import com.palette.palette.services.ECommerceService;

import lombok.RequiredArgsConstructor;

/** Public catalogue browsing — no login needed. */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ECommerceService eCommerceService;

    @GetMapping
    public List<ProductDTO> getAllProducts() {
        return eCommerceService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ProductDTO getProductById(@PathVariable Long id) {
        return eCommerceService.getProductById(id);
    }

    /** e.g. /api/products/category/SOFA */
    @GetMapping("/category/{category}")
    public List<ProductDTO> getByCategory(@PathVariable String category) {
        return eCommerceService.getProductsByCategory(category);
    }

    @GetMapping("/search")
    public List<ProductDTO> searchProducts(@RequestParam String keyword) {
        return eCommerceService.searchProductsByKeyword(keyword);
    }

    @GetMapping("/filter")
    public List<ProductDTO> filterByMaxPrice(@RequestParam double maxPrice) {
        return eCommerceService.getProductsByMaxPrice(maxPrice);
    }

    @GetMapping("/standalone")
    public List<ProductDTO> getStandaloneProducts() {
        return eCommerceService.getStandaloneProducts();
    }

    @GetMapping("/bundles")
    public List<FurnitureBundleDTO> getAllBundles() {
        return eCommerceService.getAllBundles();
    }

    @GetMapping("/bundles/{id}")
    public FurnitureBundleDTO getBundleById(@PathVariable Long id) {
        return eCommerceService.getBundleById(id);
    }

    /** e.g. /api/products/bundles/room/BEDROOM */
    @GetMapping("/bundles/room/{roomType}")
    public List<FurnitureBundleDTO> getBundlesByRoomType(@PathVariable String roomType) {
        return eCommerceService.getBundlesByRoomType(roomType);
    }

    @GetMapping("/bundles/filter")
    public List<FurnitureBundleDTO> getBundlesByMaxPrice(@RequestParam double maxPrice) {
        return eCommerceService.getBundlesByMaxPrice(maxPrice);
    }
}
