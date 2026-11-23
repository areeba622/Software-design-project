package com.palette.palette.patterns;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import com.palette.palette.entities.CustomRoom;
import com.palette.palette.entities.Product;
import com.palette.palette.entities.Product.ProductCategory;
import com.palette.palette.patterns.builder.RoomBuilder;

/** Builder pattern (pricing comes from the Strategy pattern). */
class RoomBuilderTest {

    static Product product(long id, String name, double price, ProductCategory category) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setPriceInPKR(price);
        p.setCategory(category);
        return p;
    }

    private static final Product HARDWOOD = product(1, "Warm Hardwood", 100, ProductCategory.FLOORING);
    private static final Product BOTANICAL = product(2, "Botanical Leaves", 50, ProductCategory.WALLPAPER);
    private static final Product SOFA = product(3, "Sofa", 80_000, ProductCategory.SOFA);
    private static final Product RUG = product(4, "Rug", 20_000, ProductCategory.RUG);

    @Test
    void buildsAndPricesARoomStepByStep() {
        // 12 x 15 room: floor 180 sq ft, walls 2 x (12 + 15) x 10 = 540 sq ft
        CustomRoom room = new RoomBuilder("living_room", 12, 15)
                .withFlooring(HARDWOOD)
                .withWallpaper(BOTANICAL)
                .addFurniture(SOFA)
                .addFurniture(RUG)
                .build();

        assertThat(room.getRoomType()).isEqualTo("LIVING_ROOM");
        assertThat(room.getWidth()).isEqualTo(12);
        assertThat(room.getLength()).isEqualTo(15);
        assertThat(room.getFlooring()).isEqualTo("Warm Hardwood");
        assertThat(room.getWallpaper()).isEqualTo("Botanical Leaves");
        assertThat(room.getFurnitureItems()).containsExactly("Sofa", "Rug");
        assertThat(room.getTotalPrice()).isEqualTo(100 * 180 + 50 * 540 + 80_000 + 20_000);
        assertThat(room.getIsFinalized()).isFalse();
    }

    @Test
    void priceCanBePreviewedBeforeBuilding() {
        RoomBuilder builder = new RoomBuilder("BEDROOM", 10, 10).addFurniture(SOFA);
        assertThat(builder.currentPrice()).isEqualTo(80_000);

        builder.withFlooring(HARDWOOD);
        assertThat(builder.currentPrice()).isEqualTo(80_000 + 100 * 100);
    }

    @Test
    void flooringAndWallpaperAreOptional() {
        CustomRoom room = new RoomBuilder("BEDROOM", 10, 10).addFurniture(SOFA).build();

        assertThat(room.getFlooring()).isEqualTo("Standard");
        assertThat(room.getWallpaper()).isNull();
        assertThat(room.getTotalPrice()).isEqualTo(80_000);
    }

    @Test
    void needsAtLeastOneFurnitureItem() {
        RoomBuilder builder = new RoomBuilder("BEDROOM", 10, 10).withFlooring(HARDWOOD);

        assertThatThrownBy(builder::build)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("furniture");
    }

    @Test
    void flooringAndWallpaperMustBeTheRightKindOfProduct() {
        RoomBuilder builder = new RoomBuilder("BEDROOM", 10, 10);

        assertThatThrownBy(() -> builder.withFlooring(SOFA)).hasMessageContaining("not a flooring");
        assertThatThrownBy(() -> builder.withWallpaper(HARDWOOD)).hasMessageContaining("not a wallpaper");
        assertThatThrownBy(() -> builder.addFurniture(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest
    @ValueSource(ints = { 0, -5 })
    void rejectsNonPositiveDimensions(int bad) {
        assertThatThrownBy(() -> new RoomBuilder("BEDROOM", bad, 10)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new RoomBuilder("BEDROOM", 10, bad)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsBlankRoomType() {
        assertThatThrownBy(() -> new RoomBuilder(" ", 10, 10)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void builtRoomDoesNotChangeWhenTheBuilderIsReused() {
        RoomBuilder builder = new RoomBuilder("BEDROOM", 10, 10).addFurniture(SOFA);
        CustomRoom room = builder.build();

        builder.addFurniture(RUG);

        assertThat(room.getFurnitureItems()).containsExactly("Sofa");
        assertThat(room.getTotalPrice()).isEqualTo(80_000);
    }
}
