package com.palette.palette.patterns.factory;
import com.palette.palette.patterns.nullobject.NoStyleBundle;
import java.util.ArrayList;
import java.util.List;

/**
 * FACTORY PATTERN: AestheticBundleFactory
 * * Styles: BOHEMIAN, SCANDINAVIAN, MINIMALIST
 * Includes Null Object Pattern fallback via NoStyleBundle inside the default block.
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
                // Agar standard workflow ke bahar ka koi unmapped input aata hai, 
                // toh exception throw karne ke bajaye safely safe wrapper return hoga.
                return new NoStyleBundle();
        }
    }

    // ── BOHEMIAN STYLE BUILDER ────────────────────────────────────────────────

    private static StyleBundle buildBohemianBundle(String roomType) {
        StyleBundle bundle = new StyleBundle();
        bundle.setStyleName("BOHEMIAN");
        bundle.setStyleDescription("Free-spirited, eclectic, artistic, nature-inspired with vibrant colors and mixed textures");
        bundle.setRoomType(roomType);
        bundle.setDiscountFactor(0.95);  // 5% off bundle deal

        switch (roomType) {
            case "BEDROOM":
                bundle.addRecommendedProductId(1L);   // Macramé Bed Frame
                bundle.addRecommendedProductId(5L);   // Tapestry Wall Art
                bundle.addRecommendedProductId(8L);   // Rattan Chair
                bundle.addRecommendedProductId(12L);  // Jute Rug
                break;
            case "LIVING_ROOM":
                bundle.addRecommendedProductId(2L);   // Bohemian Sofa
                bundle.addRecommendedProductId(6L);   // Hanging Plants
                bundle.addRecommendedProductId(9L);   // Low Wooden Table
                bundle.addRecommendedProductId(13L);  // Colorful Pillow Set
                break;
            case "KITCHEN":
                bundle.addRecommendedProductId(3L);   // Wooden Table
                bundle.addRecommendedProductId(7L);   // Ceramic Plates
                bundle.addRecommendedProductId(10L);  // Woven Baskets
                bundle.addRecommendedProductId(14L);  // Bohemian Lighting
                break;
            case "DINING_ROOM":
                bundle.addRecommendedProductId(15L);  // Bohemian Dining Table
                bundle.addRecommendedProductId(16L);  // Mixed Wood Chairs
                bundle.addRecommendedProductId(17L);  // Eclectic Decor
                bundle.addRecommendedProductId(18L);  // Patterned Tablecloth
                break;
            default:
                // Edge Case Safety: Agar kisi ne unexpected room type choose kiya tab bhi 
                // khali bundle context safely pass ho jaye.
                return new NoStyleBundle();
        }

        return bundle;
    }

    // ── SCANDINAVIAN STYLE BUILDER ────────────────────────────────────────────

    private static StyleBundle buildScandinavianBundle(String roomType) {
        StyleBundle bundle = new StyleBundle();
        bundle.setStyleName("SCANDINAVIAN");
        bundle.setStyleDescription("Light, airy, functional design with natural materials, cozy warmth, and minimalist sophistication");
        bundle.setRoomType(roomType);
        bundle.setDiscountFactor(0.92);  // 8% off bundle deal

        switch (roomType) {
            case "BEDROOM":
                bundle.addRecommendedProductId(19L);  // Light Wood Bed
                bundle.addRecommendedProductId(20L);  // Soft Wool Blanket
                bundle.addRecommendedProductId(21L);  // Natural Lighting Fixture
                bundle.addRecommendedProductId(22L);  // Light Neutral Rug
                break;
            case "LIVING_ROOM":
                bundle.addRecommendedProductId(23L);  // Scandinavian Sofa
                bundle.addRecommendedProductId(24L);  // Light Wood Coffee Table
                bundle.addRecommendedProductId(25L);  // Cozy Blanket
                bundle.addRecommendedProductId(26L);  // Minimalist Shelves
                break;
            case "KITCHEN":
                bundle.addRecommendedProductId(27L);  // Light Oak Table
                bundle.addRecommendedProductId(28L);  // Natural Wood Chairs
                bundle.addRecommendedProductId(29L);  // Scandinavian Lighting
                bundle.addRecommendedProductId(30L);  // Functional Storage
                break;
            case "DINING_ROOM":
                bundle.addRecommendedProductId(31L);  // Light Wood Dining Table
                bundle.addRecommendedProductId(32L);  // Minimalist Dining Chairs
                bundle.addRecommendedProductId(33L);  // Neutral Centerpiece
                bundle.addRecommendedProductId(34L);  // Natural Lighting
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
        bundle.setDiscountFactor(1.0);  // No discount for minimalist

        switch (roomType) {
            case "BEDROOM":
                bundle.addRecommendedProductId(35L);  // Platform Bed
                bundle.addRecommendedProductId(36L);  // Simple Nightstand
                bundle.addRecommendedProductId(37L);  // Minimalist Lamp
                bundle.addRecommendedProductId(38L);  // Solid Color Rug
                break;
            case "LIVING_ROOM":
                bundle.addRecommendedProductId(39L);  // Sleek Sofa
                bundle.addRecommendedProductId(40L);  // Glass Coffee Table
                bundle.addRecommendedProductId(41L);  // LED Lighting
                bundle.addRecommendedProductId(42L);  // Minimalist Shelves
                break;
            case "KITCHEN":
                bundle.addRecommendedProductId(43L);  // Stainless Steel Table
                bundle.addRecommendedProductId(44L);  // Modern Chairs
                bundle.addRecommendedProductId(45L);  // Minimalist Decor
                bundle.addRecommendedProductId(46L);  // Smart Storage
                break;
            case "DINING_ROOM":
                bundle.addRecommendedProductId(47L);  // Minimalist Dining Table
                bundle.addRecommendedProductId(48L);  // Simple Dining Chairs
                bundle.addRecommendedProductId(49L);  // Clean Lighting
                bundle.addRecommendedProductId(50L);  // Minimalist Centerpiece
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