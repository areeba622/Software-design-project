package com.palette.palette.patterns.factory;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.palette.palette.patterns.nullobject.NoStyleBundle;

/**
 * Entry point to the bundle factories: picks the concrete
 * {@link StyleBundleFactory} for a style and calls its factory method.
 *
 * <pre>
 * StyleBundle bundle = AestheticBundleFactory.createBundle("BOHEMIAN", "BEDROOM");
 * </pre>
 *
 * An unknown style (or a style with nothing for that room) gives the
 * {@link NoStyleBundle} null object, never {@code null} or an exception.
 */
public final class AestheticBundleFactory {

    public static final String BOHEMIAN = "BOHEMIAN";
    public static final String SCANDINAVIAN = "SCANDINAVIAN";
    public static final String MINIMALIST = "MINIMALIST";

    private static final List<String> ROOM_TYPES = List.of("BEDROOM", "LIVING_ROOM", "KITCHEN", "DINING_ROOM");

    /** Registered concrete creators, in display order. */
    private static final Map<String, StyleBundleFactory> FACTORIES = new LinkedHashMap<>();
    static {
        register(new BohemianBundleFactory());
        register(new ScandinavianBundleFactory());
        register(new MinimalistBundleFactory());
    }

    private AestheticBundleFactory() {
    }

    private static void register(StyleBundleFactory factory) {
        FACTORIES.put(factory.styleName(), factory);
    }

    public static StyleBundle createBundle(String style, String roomType) {
        if (style == null || style.isBlank()) {
            return new NoStyleBundle();
        }
        StyleBundleFactory factory = FACTORIES.get(style.trim().toUpperCase(Locale.ROOT));
        return factory == null ? new NoStyleBundle() : factory.createBundle(roomType);
    }

    public static List<String> getAllStyles() {
        return List.copyOf(FACTORIES.keySet());
    }

    public static List<String> getAllRoomTypes() {
        return ROOM_TYPES;
    }
}
