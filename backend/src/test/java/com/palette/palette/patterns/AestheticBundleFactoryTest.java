package com.palette.palette.patterns;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;

import com.palette.palette.patterns.factory.AestheticBundleFactory;
import com.palette.palette.patterns.factory.StyleBundle;
import com.palette.palette.patterns.nullobject.NoStyleBundle;

/** Factory pattern + Null Object pattern. */
class AestheticBundleFactoryTest {

    @ParameterizedTest(name = "{0} gets discount factor {1}")
    @CsvSource({ "BOHEMIAN, 0.95", "SCANDINAVIAN, 0.92", "MINIMALIST, 1.0" })
    void eachStyleHasItsOwnDiscount(String style, double expectedFactor) {
        StyleBundle bundle = AestheticBundleFactory.createBundle(style, "LIVING_ROOM");

        assertThat(bundle).isNotInstanceOf(NoStyleBundle.class);
        assertThat(bundle.getStyleName()).isEqualTo(style);
        assertThat(bundle.getRoomType()).isEqualTo("LIVING_ROOM");
        assertThat(bundle.getDiscountFactor()).isEqualTo(expectedFactor);
        assertThat(bundle.getProductCount()).isPositive();
    }

    @Test
    void inputIsCaseInsensitive() {
        StyleBundle bundle = AestheticBundleFactory.createBundle("bohemian", "bedroom");

        assertThat(bundle.getStyleName()).isEqualTo("BOHEMIAN");
        assertThat(bundle.getRoomType()).isEqualTo("BEDROOM");
    }

    @Test
    void unknownStyleFallsBackToNullObject() {
        assertIsNullObject(AestheticBundleFactory.createBundle("ART_DECO", "BEDROOM"));
    }

    @Test
    void unknownRoomFallsBackToNullObject() {
        assertIsNullObject(AestheticBundleFactory.createBundle("BOHEMIAN", "GARAGE"));
    }

    @ParameterizedTest
    @NullAndEmptySource
    void missingInputFallsBackToNullObject(String blank) {
        assertIsNullObject(AestheticBundleFactory.createBundle(blank, "BEDROOM"));
        assertIsNullObject(AestheticBundleFactory.createBundle("BOHEMIAN", blank));
    }

    @Test
    void eachCallReturnsAFreshBundle() {
        StyleBundle first = AestheticBundleFactory.createBundle("MINIMALIST", "KITCHEN");
        first.addRecommendedProductId(999L);

        StyleBundle second = AestheticBundleFactory.createBundle("MINIMALIST", "KITCHEN");

        assertThat(second.getRecommendedProductIds()).doesNotContain(999L);
    }

    private static void assertIsNullObject(StyleBundle bundle) {
        assertThat(bundle).isInstanceOf(NoStyleBundle.class);
        assertThat(bundle.getStyleName()).isEqualTo("NONE");
        assertThat(bundle.getDiscountFactor()).isEqualTo(1.0);
        assertThat(bundle.getRecommendedProductIds()).isEmpty();
        assertThat(bundle.getProductCount()).isZero();
    }
}
