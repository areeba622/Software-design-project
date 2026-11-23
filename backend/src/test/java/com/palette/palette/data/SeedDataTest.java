package com.palette.palette.data;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.palette.palette.entities.Product;
import com.palette.palette.patterns.factory.AestheticBundleFactory;
import com.palette.palette.patterns.factory.StyleBundle;
import com.palette.palette.repository.DesignerRepository;
import com.palette.palette.repository.ProductRepository;

/**
 * Checks the seed data from V2__seed_catalog.sql, and that it agrees with the
 * product IDs hard-coded in {@link AestheticBundleFactory}.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // use the PostgreSQL-mode H2 from test config
class SeedDataTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DesignerRepository designerRepository;

    @Test
    void catalogueIsSeeded() {
        assertThat(productRepository.count()).isEqualTo(122);
        assertThat(designerRepository.count()).isEqualTo(6);
    }

    @Test
    void everyProductHasTheFieldsTheUiNeeds() {
        assertThat(productRepository.findAll()).allSatisfy(p -> {
            assertThat(p.getName()).isNotBlank();
            assertThat(p.getPriceInPKR()).isPositive();
            assertThat(p.getImageUrl()).startsWith("/products/");
            assertThat(p.getCategory()).isNotNull();
            assertThat(p.getRoomType()).isNotNull();
            assertThat(p.getAestheticStyle()).isNotNull();
        });
    }

    @Test
    void everyDesignerHasAPreferredStyle() {
        assertThat(designerRepository.findAll()).allSatisfy(d -> {
            assertThat(d.getPreferredStyle()).isNotNull();
            assertThat(d.getHourlyRatePKR()).isPositive();
        });
    }

    static Iterable<Object[]> styleRoomPairs() {
        return AestheticBundleFactory.getAllStyles().stream()
                .flatMap(style -> AestheticBundleFactory.getAllRoomTypes().stream()
                        .map(room -> new Object[] { style, room }))
                .toList();
    }

    /**
     * The quiz only shows a recommended product if its room type matches the
     * quiz room, so every ID in the factory must point at a real product with
     * the same style and room. This caught products 16-18 being filed under
     * KITCHEN while the factory used them for DINING_ROOM.
     */
    @ParameterizedTest(name = "{0} / {1}")
    @MethodSource("styleRoomPairs")
    void factoryRecommendationsPointAtMatchingProducts(String style, String room) {
        Map<Long, Product> products = productRepository.findAll().stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        StyleBundle bundle = AestheticBundleFactory.createBundle(style, room);

        assertThat(bundle.getRecommendedProductIds()).isNotEmpty();
        assertThat(bundle.getRecommendedProductIds()).allSatisfy(id -> {
            Product product = products.get(id);
            assertThat(product).as("product %d exists", id).isNotNull();
            assertThat(product.getAestheticStyle().name()).as("style of product %d", id).isEqualTo(style);
            assertThat(product.getRoomType().name()).as("room of product %d", id).isEqualTo(room);
        });
    }
}
