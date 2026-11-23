package com.palette.palette.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.palette.palette.dto.CartItemRequestDTO;
import com.palette.palette.dto.CartResponseDTO;
import com.palette.palette.entities.Cart;
import com.palette.palette.entities.CartItem;
import com.palette.palette.entities.CustomRoom;
import com.palette.palette.entities.FurnitureBundle;
import com.palette.palette.entities.Product;
import com.palette.palette.entities.User;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.patterns.composite.InventoryItem;
import com.palette.palette.repository.CartItemRepository;
import com.palette.palette.repository.CartRepository;
import com.palette.palette.repository.CustomRoomRepository;
import com.palette.palette.repository.FurnitureBundleRepository;
import com.palette.palette.repository.ProductRepository;
import com.palette.palette.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * The user's shopping cart.
 *
 * <p>Products, bundles and custom rooms are all {@link InventoryItem}s (Composite
 * pattern), so every cart line is priced the same way: {@code item.getPrice() × quantity}.
 * {@link #priceLines(Cart)} is the one place that does this; checkout uses it too, so the
 * cart total and the order total always agree.</p>
 */
@Service
@RequiredArgsConstructor
public class CartManager {

    private static final Logger log = LoggerFactory.getLogger(CartManager.class);
    private static final int MAX_QUANTITY = 99;

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final FurnitureBundleRepository bundleRepository;
    private final CustomRoomRepository customRoomRepository;
    private final UserRepository userRepository;

    /** A cart line together with the item it points at and its current price. */
    public record PricedLine(CartItem line, InventoryItem item, double unitPrice) {
        public double lineTotal() {
            return unitPrice * line.getQuantity();
        }
    }

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            log.info("Creating cart for user {}", userId);
            return cartRepository.save(new Cart(user));
        });
    }

    // ── Add ──────────────────────────────────────────────────────────────────

    @Transactional
    public CartResponseDTO addItemToCart(Long userId, CartItemRequestDTO dto) {
        Cart cart = getOrCreateCart(userId);
        CartItem.ItemType type = parseItemType(dto.getItemType());

        Optional<CartItem> existing;
        InventoryItem item;
        switch (type) {
            case PRODUCT -> {
                Product product = productRepository.findById(dto.getItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getItemId()));
                existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
                item = product;
            }
            case BUNDLE -> {
                FurnitureBundle bundle = bundleRepository.findById(dto.getItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Bundle not found with id: " + dto.getItemId()));
                existing = cartItemRepository.findByCartIdAndBundleId(cart.getId(), bundle.getId());
                item = bundle;
            }
            case CUSTOM_ROOM -> {
                // Only the room's owner may buy it.
                CustomRoom room = customRoomRepository.findByIdAndUserId(dto.getItemId(), userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Custom room not found with id: " + dto.getItemId()));
                existing = cartItemRepository.findByCartIdAndCustomRoomId(cart.getId(), room.getId());
                item = room;
            }
            default -> throw new IllegalArgumentException("Designers can't be added to the cart yet.");
        }

        CartItem line = existing.orElseGet(() -> newLine(cart, type, item));
        int quantity = line.getId() == null ? dto.getQuantity() : line.getQuantity() + dto.getQuantity();
        if (quantity > MAX_QUANTITY) {
            throw new IllegalArgumentException("You can have at most " + MAX_QUANTITY + " of one item in your cart.");
        }
        line.setQuantity(quantity);
        line.setUnitPrice(item.getPrice());
        cartItemRepository.save(line);

        log.debug("Cart {}: {} {} x{}", cart.getId(), type, item.getId(), quantity);
        return getCartSummary(userId);
    }

    private static CartItem newLine(Cart cart, CartItem.ItemType type, InventoryItem item) {
        CartItem line = new CartItem();
        line.setCart(cart);
        line.setItemType(type);
        switch (type) {
            case PRODUCT -> line.setProduct((Product) item);
            case BUNDLE -> line.setBundle((FurnitureBundle) item);
            case CUSTOM_ROOM -> line.setCustomRoom((CustomRoom) item);
            default -> throw new IllegalStateException("Unsupported cart item type: " + type);
        }
        cart.getItems().add(line);
        return line;
    }

    private static CartItem.ItemType parseItemType(String raw) {
        try {
            return CartItem.ItemType.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown item type '" + raw + "'. Use PRODUCT, BUNDLE or CUSTOM_ROOM.");
        }
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    @Transactional
    public CartResponseDTO getCartSummary(Long userId) {
        Cart cart = getOrCreateCart(userId);
        List<PricedLine> priced = priceLines(cart);

        List<CartResponseDTO.CartLineDTO> lines = new ArrayList<>();
        for (PricedLine p : priced) {
            CartResponseDTO.CartLineDTO dto = new CartResponseDTO.CartLineDTO();
            dto.setCartItemId(p.line().getId());
            dto.setItemType(p.line().getItemType().name());
            dto.setItemId(p.item().getId());
            dto.setItemName(p.item().getName());
            dto.setQuantity(p.line().getQuantity());
            dto.setUnitPrice(p.unitPrice());
            dto.setLineTotal(p.lineTotal());
            dto.setSubItems(subItems(p.item()));
            lines.add(dto);
        }

        CartResponseDTO response = new CartResponseDTO();
        response.setCartId(cart.getId());
        response.setUserId(userId);
        response.setLines(lines);
        response.setGrandTotal(priced.stream().mapToDouble(PricedLine::lineTotal).sum());
        return response;
    }

    /** Prices every line at the item's current price. Lines whose item was deleted are skipped. */
    public List<PricedLine> priceLines(Cart cart) {
        List<PricedLine> priced = new ArrayList<>();
        for (CartItem line : cart.getItems()) {
            InventoryItem item = switch (line.getItemType()) {
                case PRODUCT -> line.getProduct();
                case BUNDLE -> line.getBundle();
                case CUSTOM_ROOM -> line.getCustomRoom();
                case DESIGNER_HIRE -> null;
            };
            if (item == null) {
                log.warn("Skipping cart line {}: its item no longer exists", line.getId());
                continue;
            }
            priced.add(new PricedLine(line, item, item.getPrice()));
        }
        return priced;
    }

    private static List<String> subItems(InventoryItem item) {
        if (item instanceof FurnitureBundle bundle) {
            return bundle.getProducts().stream().map(Product::getName).toList();
        }
        if (item instanceof CustomRoom room) {
            return List.copyOf(room.getFurnitureItems());
        }
        return null;
    }

    // ── Remove ───────────────────────────────────────────────────────────────

    @Transactional
    public CartResponseDTO removeItemFromCart(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem line = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        cart.getItems().remove(line); // orphanRemoval deletes the row
        return getCartSummary(userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        getOrCreateCart(userId).getItems().clear();
    }
}
