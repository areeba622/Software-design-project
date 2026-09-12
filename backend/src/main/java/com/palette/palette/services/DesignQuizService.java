package com.palette.palette.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.palette.palette.dto.DesignQuizRequestDTO;
import com.palette.palette.dto.DesignQuizResponseDTO;
import com.palette.palette.dto.ProductDTO;
import com.palette.palette.entities.DesignQuiz;
import com.palette.palette.entities.Product;
import com.palette.palette.entities.User;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.patterns.factory.AestheticBundleFactory;
import com.palette.palette.patterns.factory.StyleBundle;
import com.palette.palette.repository.DesignQuizRepository;
import com.palette.palette.repository.ProductRepository;
import com.palette.palette.repository.UserRepository;

/**
 * DesignQuizService - UPDATED FOR BOHEMIAN, SCANDINAVIAN, MINIMALIST
 */
@Service
public class DesignQuizService {

    private final ProductRepository productRepository;
    private final DesignQuizRepository designQuizRepository;
    private final UserRepository userRepository;

    public DesignQuizService(ProductRepository productRepository,
            DesignQuizRepository designQuizRepository,
            UserRepository userRepository) {
        this.productRepository = productRepository;
        this.designQuizRepository = designQuizRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public DesignQuizResponseDTO submitQuiz(DesignQuizRequestDTO dto, Long userId) {

        if (dto.getStyle() == null || dto.getStyle().isBlank()) {
            throw new IllegalArgumentException("Style cannot be empty");
        }

        if (dto.getRoomType() == null || dto.getRoomType().isBlank()) {
            throw new IllegalArgumentException("Room type cannot be empty");
        }

        String normalizedStyle = dto.getStyle().toUpperCase();
        String normalizedRoom = dto.getRoomType().toUpperCase();

        // ✅ FACTORY CREATES BUNDLE WITH UPDATED STYLES
        StyleBundle styleBundle = AestheticBundleFactory.createBundle(
                normalizedStyle,
                normalizedRoom);

        List<Product> productsInRoom = productRepository.findByRoomType(
                Product.RoomType.valueOf(normalizedRoom));

        List<ProductDTO> recommendedProducts = productsInRoom.stream()
                .filter(p -> styleBundle.getRecommendedProductIds().contains(p.getId()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        double totalPrice = recommendedProducts.stream()
                .mapToDouble(ProductDTO::getPriceInPKR)
                .sum();

        double discountedPrice = totalPrice * styleBundle.getDiscountFactor();

        if (userId != null) {
            saveQuizHistory(userId, normalizedStyle, normalizedRoom);
        }

        String message = String.format(
                "Perfect %s %s setup! %d items recommended at PKR %.0f (with discount)",
                normalizedStyle,
                normalizedRoom,
                recommendedProducts.size(),
                discountedPrice);

        // Create BundleDTO from StyleBundle
        DesignQuizResponseDTO.BundleDTO bundleDTO = new DesignQuizResponseDTO.BundleDTO(
                null,
                normalizedStyle,
                styleBundle.getStyleDescription(),
                styleBundle.getDiscountFactor(),
                totalPrice);

        // Create recommendation title
        String recommendationTitle = normalizedStyle + " " + normalizedRoom;

        DesignQuizResponseDTO response = new DesignQuizResponseDTO(
                normalizedStyle,
                normalizedRoom,
                recommendationTitle,
                message,
                bundleDTO,
                recommendedProducts);

        return response;
    }

    @Transactional
    public DesignQuizResponseDTO submitQuiz(DesignQuizRequestDTO dto) {
        return submitQuiz(dto, null);
    }

    private void saveQuizHistory(Long userId, String style, String roomType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));

        DesignQuiz quiz = new DesignQuiz(user, style, roomType);
        designQuizRepository.save(quiz);
    }

    @Transactional(readOnly = true)
    public List<DesignQuiz> getUserQuizHistory(Long userId) {
        return designQuizRepository.findByUserId(userId);
    }

        @Transactional(readOnly = true)
    public DesignQuiz getLatestQuiz(Long userId) {
        return designQuizRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No quiz found for user with id: " + userId));
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO(
                product.getId(),
                product.getName(),
                product.getPriceInPKR(),
                product.getCategory() != null ? product.getCategory().toString() : "OTHER",
                product.getRoomType() != null ? product.getRoomType().toString() : "UNKNOWN",
                product.getAestheticStyle() != null ? product.getAestheticStyle().toString() : null);
        dto.setImageUrl(product.getImageUrl()); // ← ONLY CHANGE
        return dto;
    }
}