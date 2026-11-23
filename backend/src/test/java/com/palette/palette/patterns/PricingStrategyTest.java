package com.palette.palette.patterns;

import static com.palette.palette.patterns.RoomBuilderTest.product;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import com.palette.palette.entities.Product;
import com.palette.palette.entities.Product.ProductCategory;
import com.palette.palette.patterns.strategy.FloorAreaPricing;
import com.palette.palette.patterns.strategy.PerItemPricing;
import com.palette.palette.patterns.strategy.PricingStrategies;
import com.palette.palette.patterns.strategy.PricingStrategy;
import com.palette.palette.patterns.strategy.RoomDimensions;
import com.palette.palette.patterns.strategy.WallAreaPricing;

/** Strategy pattern: one interface, three interchangeable pricing rules. */
class PricingStrategyTest {

    private static final RoomDimensions ROOM = new RoomDimensions(10, 12); // floor 120, walls 440

    @Test
    void roomAreas() {
        assertThat(ROOM.floorArea()).isEqualTo(120);
        assertThat(ROOM.wallArea()).isEqualTo(440);
        assertThatThrownBy(() -> new RoomDimensions(0, 12)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void eachStrategyPricesTheSameCataloguePriceDifferently() {
        Product item = product(1, "Anything", 100, ProductCategory.DECOR);

        assertThat(new PerItemPricing().price(item, ROOM)).isEqualTo(100);
        assertThat(new FloorAreaPricing().price(item, ROOM)).isEqualTo(100 * 120);
        assertThat(new WallAreaPricing().price(item, ROOM)).isEqualTo(100 * 440);
    }

    @Test
    void theRightStrategyIsChosenFromTheProductCategory() {
        assertThat(strategyFor(ProductCategory.FLOORING)).isSameAs(PricingStrategies.FLOOR_AREA);
        assertThat(strategyFor(ProductCategory.WALLPAPER)).isSameAs(PricingStrategies.WALL_AREA);
        assertThat(PricingStrategies.forProduct(new Product())).isSameAs(PricingStrategies.PER_ITEM);
    }

    @ParameterizedTest
    @EnumSource(value = ProductCategory.class, names = { "FLOORING", "WALLPAPER" }, mode = EnumSource.Mode.EXCLUDE)
    void everythingElseIsPricedPerItem(ProductCategory category) {
        assertThat(strategyFor(category)).isSameAs(PricingStrategies.PER_ITEM);
    }

    @Test
    void strategiesDescribeThemselves() {
        assertThat(PricingStrategies.FLOOR_AREA.describe()).contains("floor");
        assertThat(PricingStrategies.WALL_AREA.describe()).contains("wall");
    }

    private static PricingStrategy strategyFor(ProductCategory category) {
        return PricingStrategies.forProduct(product(1, "x", 1, category));
    }
}
