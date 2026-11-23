package com.palette.palette.patterns;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import com.palette.palette.entities.CustomRoom;
import com.palette.palette.patterns.builder.RoomBuilder;

/** Builder pattern. */
class RoomBuilderTest {

    @Test
    void buildsARoomStepByStep() {
        CustomRoom room = new RoomBuilder("LIVING_ROOM", 12, 15)
                .setFlooring("Warm Hardwood")
                .setWallpaper("Botanical Leaves")
                .addFurniture("Sofa")
                .addFurniture("Rug")
                .setTotalPrice(150_000)
                .build();

        assertThat(room.getRoomType()).isEqualTo("LIVING_ROOM");
        assertThat(room.getWidth()).isEqualTo(12);
        assertThat(room.getLength()).isEqualTo(15);
        assertThat(room.getFlooring()).isEqualTo("Warm Hardwood");
        assertThat(room.getWallpaper()).isEqualTo("Botanical Leaves");
        assertThat(room.getFurnitureItems()).containsExactly("Sofa", "Rug");
        assertThat(room.getTotalPrice()).isEqualTo(150_000);
        assertThat(room.getIsFinalized()).isFalse();
    }

    @Test
    void flooringDefaultsToStandard() {
        CustomRoom room = new RoomBuilder("BEDROOM", 10, 10).addFurniture("Bed").build();

        assertThat(room.getFlooring()).isEqualTo("Standard");
        assertThat(room.getWallpaper()).isNull();
    }

    @Test
    void blankFurnitureItemsAreIgnored() {
        CustomRoom room = new RoomBuilder("BEDROOM", 10, 10)
                .addFurniture(null)
                .addFurniture("  ")
                .addFurniture("Bed")
                .build();

        assertThat(room.getFurnitureItems()).containsExactly("Bed");
    }

    @Test
    void needsAtLeastOneFurnitureItem() {
        RoomBuilder builder = new RoomBuilder("BEDROOM", 10, 10);

        assertThatThrownBy(builder::build)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("furniture");
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
    void builtRoomDoesNotShareTheBuildersFurnitureList() {
        RoomBuilder builder = new RoomBuilder("BEDROOM", 10, 10).addFurniture("Bed");
        CustomRoom room = builder.build();

        builder.addFurniture("Lamp");

        assertThat(room.getFurnitureItems()).containsExactly("Bed");
    }
}
