package com.palette.palette.patterns.factory;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.palette.palette.patterns.nullobject.NoStyleBundle;

/**
 * FACTORY METHOD PATTERN — the abstract creator.
 *
 * <p>{@link #createBundle(String)} is the same for every style: look up the
 * curated products for the room and package them with the style's name,
 * description and discount. What differs per style is supplied by the
 * subclasses through the factory hooks ({@link #styleName()},
 * {@link #discountFactor()}, {@link #curatedProducts()}, ...).</p>
 *
 * <p>Concrete creators: {@link BohemianBundleFactory},
 * {@link ScandinavianBundleFactory}, {@link MinimalistBundleFactory}.
 * Adding a style means adding one subclass and registering it in
 * {@link AestheticBundleFactory} — no existing code changes.</p>
 */
public abstract class StyleBundleFactory {

    /** e.g. "BOHEMIAN". */
    public abstract String styleName();

    public abstract String styleDescription();

    /** Price multiplier for buying the whole bundle, e.g. 0.95 = 5% off. */
    public abstract double discountFactor();

    /** Product ids hand-picked for each room type of this style. */
    protected abstract Map<String, List<Long>> curatedProducts();

    /**
     * The factory method. Returns a fresh {@link StyleBundle}, or the
     * {@link NoStyleBundle} null object when this style has nothing for the room.
     */
    public final StyleBundle createBundle(String roomType) {
        if (roomType == null || roomType.isBlank()) {
            return new NoStyleBundle();
        }
        String room = roomType.trim().toUpperCase(Locale.ROOT);
        List<Long> ids = curatedProducts().get(room);
        if (ids == null || ids.isEmpty()) {
            return new NoStyleBundle();
        }

        StyleBundle bundle = new StyleBundle(styleName(), styleDescription(), room, discountFactor());
        ids.forEach(bundle::addRecommendedProductId);
        return bundle;
    }
}
