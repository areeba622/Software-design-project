package com.palette.palette.patterns;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.palette.palette.entities.CustomRoom;
import com.palette.palette.entities.FurnitureBundle;
import com.palette.palette.entities.Product;
import com.palette.palette.patterns.composite.InventoryItem;

/** Composite pattern: products, bundles and custom rooms all price the same way. */
class CompositeInventoryTest {

    private static Product product(String name, double price) {
        Product p = new Product();
        p.setName(name);
        p.setPriceInPKR(price);
        return p;
    }

    @Test
    void productIsALeafWithItsOwnPrice() {
        InventoryItem sofa = product("Sofa", 80_000);

        assertThat(sofa.getPrice()).isEqualTo(80_000);
        assertThat(sofa.getName()).isEqualTo("Sofa");
    }

    @Test
    void bundlePriceIsTheDiscountedSumOfItsProducts() {
        FurnitureBundle bundle = new FurnitureBundle();
        bundle.setProducts(List.of(product("Bed", 50_000), product("Lamp", 10_000)));
        bundle.setDiscountFactor(0.9);

        assertThat(bundle.getPrice()).isEqualTo(54_000);
    }

    @Test
    void emptyBundleCostsNothing() {
        assertThat(new FurnitureBundle().getPrice()).isZero();
    }

    @Test
    void customRoomIsPricedThroughTheSameInterface() {
        CustomRoom room = new CustomRoom();
        room.setTotalPrice(120_000.0);

        List<InventoryItem> cart = List.of(product("Chair", 15_000), room);

        assertThat(cart.stream().mapToDouble(InventoryItem::getPrice).sum()).isEqualTo(135_000);
    }

    @Test
    void customRoomHasAReadableName() {
        CustomRoom room = new CustomRoom();
        room.setRoomType("LIVING_ROOM");
        room.setFlooring("Warm Hardwood");
        room.setWallpaper("Botanical Leaves");

        assertThat(room.getName()).isEqualTo("Living Room Bundle w/ Warm Hardwood & Botanical Leaves");
    }

    @Test
    void customRoomNameSkipsDefaultFlooringAndMissingWallpaper() {
        CustomRoom room = new CustomRoom();
        room.setRoomType("BEDROOM");
        room.setFlooring("Standard");

        assertThat(room.getName()).isEqualTo("Bedroom Bundle");
    }
}
