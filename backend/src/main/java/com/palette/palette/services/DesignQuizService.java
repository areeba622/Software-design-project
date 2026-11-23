package com.palette.palette.services;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.palette.palette.dto.DesignQuizResponseDTO;
import com.palette.palette.dto.ProductDTO;
import com.palette.palette.entities.DesignQuiz;
import com.palette.palette.entities.Product;
import com.palette.palette.entities.User;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.patterns.factory.AestheticBundleFactory;
import com.palette.palette.patterns.factory.StyleBundle;
import com.palette.palette.patterns.nullobject.NoStyleBundle;
import com.palette.palette.repository.DesignQuizRepository;
import com.palette.palette.repository.ProductRepository;
import com.palette.palette.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Style quiz: the Factory picks a curated bundle for (style, room). When the
 * combination is unknown the Factory returns a {@link NoStyleBundle} (Null
 * Object), and this service answers with an empty recommendation instead of
 * an error.
 */
@Service
@RequiredArgsConstructor
public class DesignQuizService {

    private final ProductRepository productRepository;
    private final DesignQuizRepository designQuizRepository;
    private final UserRepository userRepository;

    /**
     * @param userId the logged-in user, or {@code null} for a guest; only
     *               logged-in users get their result saved
     */
    @Transactional
    public DesignQuizResponseDTO submitQuiz(String style, String roomType, Long userId) {
        StyleBundle bundle = AestheticBundleFactory.createBundle(style, roomType);
        DesignQuizResponseDTO response = recommend(bundle, roomType);
        if (userId != null && bundle.isAvailable()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            designQuizRepository.save(new DesignQuiz(user, response.getAestheticStyle(), response.getRoomType()));
        }
        return response;
    }

    /** Re-creates the recommendation for the user's most recent quiz; empty if they haven't taken it. */
    @Transactional(readOnly = true)
    public Optional<DesignQuizResponseDTO> getLatestRecommendation(Long userId) {
        return designQuizRepository.findFirstByUserIdOrderByCreatedAtDesc(userId).map(latest -> {
            String room = latest.getSelectedRoomType();
            return recommend(AestheticBundleFactory.createBundle(latest.getSelectedStyle(), room), room);
        });
    }

    private DesignQuizResponseDTO recommend(StyleBundle bundle, String roomType) {
        if (!bundle.isAvailable()) { // Null Object: no curated set for this choice
            return noMatch(bundle, roomType);
        }

        List<ProductDTO> products = loadInOrder(bundle.getRecommendedProductIds());
        double fullPrice = products.stream().mapToDouble(ProductDTO::priceInPKR).sum();
        double bundlePrice = fullPrice * bundle.getDiscountFactor();
        String title = pretty(bundle.getStyleName()) + " " + pretty(bundle.getRoomType());

        return new DesignQuizResponseDTO(
                bundle.getStyleName(),
                bundle.getRoomType(),
                title,
                String.format(Locale.ROOT, "Your %s: %d hand-picked pieces for PKR %,.0f as a bundle.",
                        title, products.size(), bundlePrice),
                new DesignQuizResponseDTO.BundleDTO(null, bundle.getStyleName(), bundle.getStyleDescription(),
                        bundle.getDiscountFactor(), fullPrice),
                products);
    }

    /** Products in the order the factory listed them; unknown ids are skipped. */
    private List<ProductDTO> loadInOrder(List<Long> ids) {
        Map<Long, Product> byId = productRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        return ids.stream().map(byId::get).filter(Objects::nonNull).map(ProductDTO::from).toList();
    }

    private static DesignQuizResponseDTO noMatch(StyleBundle nullBundle, String roomType) {
        return new DesignQuizResponseDTO(
                nullBundle.getStyleName(),
                roomType == null ? nullBundle.getRoomType() : roomType.toUpperCase(Locale.ROOT),
                "No curated set yet",
                "We don't have a curated set for that combination yet. Browse the full catalogue instead.",
                new DesignQuizResponseDTO.BundleDTO(null, nullBundle.getStyleName(),
                        nullBundle.getStyleDescription(), nullBundle.getDiscountFactor(), 0.0),
                List.of());
    }

    /** LIVING_ROOM → "Living Room". */
    private static String pretty(String constant) {
        return java.util.Arrays.stream(constant.toLowerCase(Locale.ROOT).split("_"))
                .map(word -> Character.toUpperCase(word.charAt(0)) + word.substring(1))
                .collect(Collectors.joining(" "));
    }
}
