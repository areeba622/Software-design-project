package com.palette.palette.patterns.factory;

import com.palette.palette.patterns.nullobject.NoStyleBundle;
import java.util.ArrayList;
import java.util.List;

/**
 * FACTORY PATTERN: AestheticBundleFactory
 * Styles: BOHEMIAN, SCANDINAVIAN, MINIMALIST
 * Includes Null Object Pattern fallback via NoStyleBundle inside the default
 * block.
 * 
 * ✅ Product IDs updated to match actual DB seed data.
 */
public class AestheticBundleFactory {

    public static final String BOHEMIAN = "BOHEMIAN";
    public static final String SCANDINAVIAN = "SCANDINAVIAN";
    public static final String MINIMALIST = "MINIMALIST";

    /**
     * Main Factory Method
     */
    public static StyleBundle createBundle(String style, String roomType) {

        // Safety Gate: Bypasses runtime crashes if raw API requests send empty payloads
        if (style == null || style.isBlank() || roomType == null || roomType.isBlank()) {
            return new NoStyleBundle();
        }

        String normalizedStyle = style.toUpperCase();
        String normalizedRoom = roomType.toUpperCase();

        switch (normalizedStyle) {
            case BOHEMIAN:
                return buildBohemianBundle(normalizedRoom);
            case SCANDINAVIAN:
                return buildScandinavianBundle(normalizedRoom);
            case MINIMALIST:
                return buildMinimalistBundle(normalizedRoom);
            default:
                // NULL OBJECT FALLBACK
                return new NoStyleBundle();
        }
    }

    // ── BOHEMIAN STYLE BUILDER ────────────────────────────────────────────────

    private static StyleBundle buildBohemianBundle(String roomType) {
        StyleBundle bundle = new StyleBundle();
        bundle.setStyleName("BOHEMIAN");
        bundle.setStyleDescription(
                "Free-spirited, eclectic, artistic, nature-inspired with vibrant colors and mixed textures");
        bundle.setRoomType(roomType);
        bundle.setDiscountFactor(0.95); // 5% off bundle deal

        switch (roomType) {
            case "BEDROOM":
                bundle.addRecommendedProductId(90L); // Boho Rattan Canopy Bed
                bundle.addRecommendedProductId(91L); // Earthy Macrame Accent Bed
                bundle.addRecommendedProductId(97L); // Woven Macrame Swing Chair
                bundle.addRecommendedProductId(99L); // Macrame Tiered Tassel Lamp
                bundle.addRecommendedProductId(83L); // Rattan Detail Boho Wardrobe
                bundle.addRecommendedProductId(116L); // Abstract Geometric Boho Wallpaper
                break;
            case "LIVING_ROOM":
                bundle.addRecommendedProductId(106L); // Boho Chic Rattan Sofa
                bundle.addRecommendedProductId(96L); // Boho Rattan Accent Chair
                bundle.addRecommendedProductId(94L); // Boho Chic Round Coffee Table
                bundle.addRecommendedProductId(98L); // Boho Basket Pendant Light
                bundle.addRecommendedProductId(101L); // Boho Crimson Medallion Rug
                bundle.addRecommendedProductId(115L); // Boho Botanical Leaves Wallpaper
                break;
            case "KITCHEN":
                bundle.addRecommendedProductId(120L); // Boho Woven Rattan Kitchen Basket
                bundle.addRecommendedProductId(121L); // Rustic Boho Kitchen Table
                bundle.addRecommendedProductId(122L); // Boho Seagrass Kitchen Pendant Lamp
                break;
            case "DINING_ROOM":
                bundle.addRecommendedProductId(95L); // Rustic Organic Dining Table
                break;
            default:
                return new NoStyleBundle();
        }

        return bundle;
    }

    // ── SCANDINAVIAN STYLE BUILDER ────────────────────────────────────────────

    private static StyleBundle buildScandinavianBundle(String roomType) {
        StyleBundle bundle = new StyleBundle();
        bundle.setStyleName("SCANDINAVIAN");
        bundle.setStyleDescription(
                "Light, airy, functional design with natural materials, cozy warmth, and minimalist sophistication");
        bundle.setRoomType(roomType);
        bundle.setDiscountFactor(0.92); // 8% off bundle deal

        switch (roomType) {
            case "BEDROOM":
                bundle.addRecommendedProductId(31L); // Nordic Light Oak Bed
                bundle.addRecommendedProductId(32L); // Scandi Minimalist Bed
                bundle.addRecommendedProductId(56L); // Scandi Spherical Paper Lantern
                bundle.addRecommendedProductId(58L); // Nordic Bedside Ceramic Lamp
                bundle.addRecommendedProductId(65L); // Copenhagen Light Oak Wardrobe
                bundle.addRecommendedProductId(66L); // Nordic Slatted Wooden Wardrobe
                break;
            case "LIVING_ROOM":
                bundle.addRecommendedProductId(47L); // Nordic Accent Lounge Chair
                bundle.addRecommendedProductId(50L); // Scandi Minimalist Armchair
                bundle.addRecommendedProductId(53L); // Minimalist Wooden Tripod Lamp
                bundle.addRecommendedProductId(57L); // Copenhagen Arching Floor Lamp
                bundle.addRecommendedProductId(60L); // Nordic Geometric Wool Rug
                bundle.addRecommendedProductId(41L); // Nordic Glass Display Tray
                break;
            case "KITCHEN":
                bundle.addRecommendedProductId(42L); // Scandi Wooden Spoon Set
                bundle.addRecommendedProductId(43L); // Nordic Wooden Salad Bowl
                bundle.addRecommendedProductId(45L); // Matte Stoneware Coffee Mug Set
                bundle.addRecommendedProductId(46L); // Minimalist Ash Wood Serving Tray
                bundle.addRecommendedProductId(52L); // Hygge Counter Stool
                bundle.addRecommendedProductId(59L); // Lumi Geometric Wooden Pendant
                break;
            case "DINING_ROOM":
                bundle.addRecommendedProductId(48L); // Copenhagen Dining Chair
                bundle.addRecommendedProductId(51L); // Stockholm Spindle Chair
                bundle.addRecommendedProductId(54L); // Nordic Pleated Pendant Light
                break;
            default:
                return new NoStyleBundle();
        }

        return bundle;
    }

    // ── MINIMALIST STYLE BUILDER ──────────────────────────────────────────────

    private static StyleBundle buildMinimalistBundle(String roomType) {
        StyleBundle bundle = new StyleBundle();
        bundle.setStyleName("MINIMALIST");
        bundle.setStyleDescription("Clean lines, essential design, uncluttered spaces with focus on function and form");
        bundle.setRoomType(roomType);
        bundle.setDiscountFactor(1.0); // No discount for minimalist

        switch (roomType) {
            case "BEDROOM":
                bundle.addRecommendedProductId(1L); // Minimalist Platform Bed
                bundle.addRecommendedProductId(2L); // Sleek Oak Bed Frame
                bundle.addRecommendedProductId(4L); // Nordic Fabric Bed
                bundle.addRecommendedProductId(7L); // 3-Tier Geometric Wall Shelf
                bundle.addRecommendedProductId(10L); // Sleek Hexagon Wall Shelf Set
                bundle.addRecommendedProductId(24L); // Modern Cozy Armchair
                break;
            case "LIVING_ROOM":
                bundle.addRecommendedProductId(29L); // Sleek 3-Seater Minimalist Sofa
                bundle.addRecommendedProductId(20L); // Minimalist Lounge Chair
                bundle.addRecommendedProductId(23L); // Minimalist Patio Chair
                bundle.addRecommendedProductId(26L); // Elegant Corner Chair
                bundle.addRecommendedProductId(6L); // Minimalist Floating Shelf
                bundle.addRecommendedProductId(9L); // Corner Display Shelf
                break;
            case "KITCHEN":
                bundle.addRecommendedProductId(11L); // Minimalist Kitchen Cabinet Set
                bundle.addRecommendedProductId(12L); // Sleek Kitchen Island Table
                bundle.addRecommendedProductId(13L); // Modern Counter Stool
                bundle.addRecommendedProductId(14L); // Minimalist Pendant Kitchen Lamp
                bundle.addRecommendedProductId(15L); // Compact 2-Tier Spice Rack
                bundle.addRecommendedProductId(25L); // Minimalist Bar Stool
                break;
            case "DINING_ROOM":
                bundle.addRecommendedProductId(22L); // Nordic Dining Chair
                bundle.addRecommendedProductId(16L); // Nordic Dining Table Set
                bundle.addRecommendedProductId(17L); // Matte Ceramic Dinnerware Set
                bundle.addRecommendedProductId(18L); // Minimalist Floating Mug Rack
                break;
            default:
                return new NoStyleBundle();
        }

        return bundle;
    }

    /**
     * Helper: Get all style names
     */
    public static List<String> getAllStyles() {
        List<String> styles = new ArrayList<>();
        styles.add(BOHEMIAN);
        styles.add(SCANDINAVIAN);
        styles.add(MINIMALIST);
        return styles;
    }

    /**
     * Helper: Get all room types
     */
    public static List<String> getAllRoomTypes() {
        List<String> rooms = new ArrayList<>();
        rooms.add("BEDROOM");
        rooms.add("LIVING_ROOM");
        rooms.add("KITCHEN");
        rooms.add("DINING_ROOM");
        return rooms;
    }
}