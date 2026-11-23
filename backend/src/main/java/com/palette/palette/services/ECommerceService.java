package com.palette.palette.services;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.palette.palette.dto.FurnitureBundleDTO;
import com.palette.palette.dto.ProductDTO;
import com.palette.palette.entities.FurnitureBundle;
import com.palette.palette.entities.Product;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.repository.FurnitureBundleRepository;
import com.palette.palette.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

/** Read-only product and bundle catalogue. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ECommerceService {

    private final ProductRepository productRepository;
    private final FurnitureBundleRepository bundleRepository;

    // ── Products ─────────────────────────────────────────────────────────────

    public List<ProductDTO> getAllProducts() {
        return toDtos(productRepository.findAll());
    }

    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(ProductDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public List<ProductDTO> getProductsByCategory(String category) {
        return toDtos(productRepository.findByCategory(parseEnum(Product.ProductCategory.class, category, "category")));
    }

    public List<ProductDTO> getProductsByRoomType(String roomType) {
        return toDtos(productRepository.findByRoomTypeOrderByAestheticStyleAscNameAsc(
                parseEnum(Product.RoomType.class, roomType, "room type")));
    }

    public List<ProductDTO> searchProductsByKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllProducts();
        }
        return toDtos(productRepository.findByNameContainingIgnoreCase(keyword.trim()));
    }

    public List<ProductDTO> getProductsByMaxPrice(double maxPrice) {
        return toDtos(productRepository.findByPriceInPKRLessThanEqual(maxPrice));
    }

    public List<ProductDTO> getStandaloneProducts() {
        return toDtos(productRepository.findByBundleIsNull());
    }

    // ── Bundles ──────────────────────────────────────────────────────────────

    public List<FurnitureBundleDTO> getAllBundles() {
        return bundleRepository.findAll().stream().map(FurnitureBundleDTO::from).toList();
    }

    public FurnitureBundleDTO getBundleById(Long id) {
        return bundleRepository.findById(id)
                .map(FurnitureBundleDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException("Bundle not found with id: " + id));
    }

    public List<FurnitureBundleDTO> getBundlesByRoomType(String roomType) {
        return bundleRepository.findByRoomType(parseEnum(FurnitureBundle.RoomType.class, roomType, "room type"))
                .stream().map(FurnitureBundleDTO::from).toList();
    }

    /** Filters on the real composite price (sum of products × discount), not a stored copy. */
    public List<FurnitureBundleDTO> getBundlesByMaxPrice(double maxPrice) {
        return bundleRepository.findAll().stream()
                .filter(bundle -> bundle.getPrice() <= maxPrice)
                .map(FurnitureBundleDTO::from)
                .toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static List<ProductDTO> toDtos(List<Product> products) {
        return products.stream().map(ProductDTO::from).toList();
    }

    static <E extends Enum<E>> E parseEnum(Class<E> type, String value, String label) {
        try {
            return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Unknown " + label + ": " + value);
        }
    }
}
