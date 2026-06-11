package com.palette.palette.controller;

import com.palette.palette.dto.CartItemRequestDTO;
import com.palette.palette.dto.CustomRoomResponseDTO;
import com.palette.palette.dto.ProductDTO;
import com.palette.palette.dto.RoomBuilderRequestDTO;
import com.palette.palette.entities.Product;
import com.palette.palette.repository.ProductRepository;
import com.palette.palette.services.CartManager;
import com.palette.palette.services.RoomBuilderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller exposing the Room Builder API endpoints.
 *
 * <p>Base URL: {@code /api/room-builder}</p>
 *
 * <p>This controller handles the full lifecycle of custom room management:</p>
 * <ul>
 * <li>Building a new room via the Builder Pattern wizard</li>
 * <li>Retrieving individual or all rooms for a user</li>
 * <li>Updating an existing room</li>
 * <li>Deleting a room</li>
 * <li>Adding a built room to the shopping cart</li>
 * </ul>
 *
 * <p>All endpoints that require user identity accept a {@code userId} query parameter.
 * In a production system this would be replaced by extracting identity from a JWT/session.</p>
 */
@RestController
@RequestMapping("/api/room-builder")
public class RoomBuilderController {

    private final RoomBuilderService roomBuilderService;
    private final CartManager cartManager;
    private final ProductRepository productRepository; // Added dependency

    /**
     * Constructs a {@code RoomBuilderController} with its required dependencies.
     *
     * @param roomBuilderService the service handling room build/CRUD operations
     * @param cartManager        the service handling cart item operations
     * @param productRepository  the repository handling product data operations
     */
    public RoomBuilderController(RoomBuilderService roomBuilderService,
                                 CartManager cartManager,
                                 ProductRepository productRepository) { // Updated constructor
        this.roomBuilderService = roomBuilderService;
        this.cartManager = cartManager;
        this.productRepository = productRepository;
    }

    // -------------------------------------------------------------------------
    // a) POST /api/room-builder/build?userId=1
    //    Build and persist a new custom room
    // -------------------------------------------------------------------------

    /**
     * Builds a new custom room for the specified user using the Builder Pattern.
     *
     * <p>The request body is validated before being passed to the service.
     * The Builder compiles the room and calculates the total price.</p>
     *
     * <p><b>URL:</b> {@code POST /api/room-builder/build?userId={userId}}</p>
     *
     * @param userId the ID of the user building the room (query parameter)
     * @param dto    the room configuration payload; validated via Bean Validation
     * @return {@code 201 CREATED} with the newly created {@link CustomRoomResponseDTO}
     */
    @PostMapping("/build")
    public ResponseEntity<CustomRoomResponseDTO> buildRoom(
            @RequestParam Long userId,
            @Valid @RequestBody RoomBuilderRequestDTO dto) {

        CustomRoomResponseDTO response = roomBuilderService.buildRoom(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // -------------------------------------------------------------------------
    // b) GET /api/room-builder/{roomId}?userId=1
    //    Retrieve a single custom room (user-scoped)
    // -------------------------------------------------------------------------

    /**
     * Retrieves a specific custom room by its ID, scoped to the requesting user.
     *
     * <p><b>URL:</b> {@code GET /api/room-builder/{roomId}?userId={userId}}</p>
     *
     * @param roomId the ID of the custom room to retrieve (path variable)
     * @param userId the ID of the user who must own the room (query parameter)
     * @return {@code 200 OK} with the matching {@link CustomRoomResponseDTO}
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<CustomRoomResponseDTO> getRoomById(
            @PathVariable Long roomId,
            @RequestParam Long userId) {

        CustomRoomResponseDTO response = roomBuilderService.getRoomById(roomId, userId);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------------------
    // c) GET /api/room-builder/user/{userId}
    //    Retrieve all custom rooms for a user
    // -------------------------------------------------------------------------

    /**
     * Retrieves all custom rooms built by the specified user.
     *
     * <p><b>URL:</b> {@code GET /api/room-builder/user/{userId}}</p>
     *
     * @param userId the ID of the user whose rooms are to be listed (path variable)
     * @return {@code 200 OK} with a list of {@link CustomRoomResponseDTO} objects;
     * an empty list if the user has no rooms
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CustomRoomResponseDTO>> getUserRooms(
            @PathVariable Long userId) {

        List<CustomRoomResponseDTO> rooms = roomBuilderService.getUserRooms(userId);
        return ResponseEntity.ok(rooms);
    }

    // -------------------------------------------------------------------------
    // d) PATCH /api/room-builder/{roomId}?userId=1
    //    Update (rebuild) an existing custom room
    // -------------------------------------------------------------------------

    /**
     * Updates an existing custom room by rebuilding it from the provided configuration.
     *
     * <p>Ownership is validated server-side. The old room is deleted and a new room
     * is compiled via the Builder Pattern with recalculated pricing.</p>
     *
     * <p><b>URL:</b> {@code PATCH /api/room-builder/{roomId}?userId={userId}}</p>
     *
     * @param roomId the ID of the room to update (path variable)
     * @param userId the ID of the user who must own the room (query parameter)
     * @param dto    the updated room configuration payload
     * @return {@code 200 OK} with the updated {@link CustomRoomResponseDTO}
     */
    @PatchMapping("/{roomId}")
    public ResponseEntity<CustomRoomResponseDTO> updateRoom(
            @PathVariable Long roomId,
            @RequestParam Long userId,
            @Valid @RequestBody RoomBuilderRequestDTO dto) {

        CustomRoomResponseDTO response = roomBuilderService.updateRoom(roomId, userId, dto);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------------------
    // e) DELETE /api/room-builder/{roomId}?userId=1
    //    Delete a custom room
    // -------------------------------------------------------------------------

    /**
     * Deletes a custom room by its ID after validating user ownership.
     *
     * <p><b>URL:</b> {@code DELETE /api/room-builder/{roomId}?userId={userId}}</p>
     *
     * @param roomId the ID of the room to delete (path variable)
     * @param userId the ID of the user who must own the room (query parameter)
     * @return {@code 200 OK} with a plain confirmation message
     */
    @DeleteMapping("/{roomId}")
    public ResponseEntity<String> deleteRoom(
            @PathVariable Long roomId,
            @RequestParam Long userId) {

        roomBuilderService.deleteRoom(roomId, userId);
        return ResponseEntity.ok("Room deleted");
    }

    // -------------------------------------------------------------------------
    // f) POST /api/room-builder/{roomId}/add-to-cart?userId=1
    //    Add a built custom room to the shopping cart
    // -------------------------------------------------------------------------

    /**
     * Adds a previously built custom room to the user's shopping cart.
     *
     * <p>This endpoint retrieves the custom room (validating ownership), then delegates
     * to {@link CartManager} to add it as a {@code CUSTOM_ROOM} cart item with the room's
     * calculated {@code totalPrice} as the unit price.</p>
     *
     * <p><b>URL:</b> {@code POST /api/room-builder/{roomId}/add-to-cart?userId={userId}}</p>
     *
     * @param roomId      the ID of the custom room to add to the cart (path variable)
     * @param userId      the ID of the user who owns the room (query parameter)
     * @param requestBody a map containing {@code "quantity"} — the number of units to add
     * @return {@code 201 CREATED} with a plain confirmation message
     */
    @PostMapping("/{roomId}/add-to-cart")
    public ResponseEntity<String> addToCart(
            @PathVariable Long roomId,
            @RequestParam Long userId,
            @RequestBody Map<String, Integer> requestBody) {

        // Retrieve and validate the room belongs to the user
        CustomRoomResponseDTO room = roomBuilderService.getRoomById(roomId, userId);

        // Extract quantity from request body; default to 1 if not provided
        Integer quantity = requestBody.getOrDefault("quantity", 1);
        if (quantity == null || quantity < 1) {
            quantity = 1;
        }

        // Build the CartItemRequestDTO for the CUSTOM_ROOM item type
        CartItemRequestDTO cartItemRequest = new CartItemRequestDTO();
        cartItemRequest.setItemId(roomId);
        cartItemRequest.setItemType("CUSTOM_ROOM");
        cartItemRequest.setQuantity(quantity);
        cartItemRequest.setUnitPrice(room.getTotalPrice());

        // Delegate to CartManager to persist the cart item
        cartManager.addItemToCart(userId, cartItemRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body("Added to cart");
    }

    // -------------------------------------------------------------------------
    // g) GET /api/room-builder/products/{roomType}
    //    Fetch all products for a specific room type across all aesthetic styles
    // -------------------------------------------------------------------------

    /**
     * Fetch all products (all aesthetic styles) for a specific room type.
     * Used by frontend room builder wizard (Step 3) to display furniture options.
     *
     * <p><b>URL:</b> {@code GET /api/room-builder/products/{roomType}}</p>
     *
     * @param roomType the string name of the room type target
     * @return {@code 200 OK} containing filtered {@link ProductDTO} items
     */
    @GetMapping("/products/{roomType}")
    public ResponseEntity<List<ProductDTO>> getProductsByRoomType(
            @PathVariable String roomType) {

        try {
            Product.RoomType type = Product.RoomType.valueOf(roomType.toUpperCase());
            List<Product> products = productRepository.findByRoomTypeOrderByAestheticStyleAscNameAsc(type);

            List<ProductDTO> dtos = products.stream()
                    .map(this::convertToProductDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid room type: " + roomType);
        }
    }

    // Helper method to convert Product entity to ProductDTO wrapper
    private ProductDTO convertToProductDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPriceInPKR(product.getPriceInPKR());
        dto.setImageUrl(product.getImageUrl());
        dto.setCategory(product.getCategory() != null ? product.getCategory().toString() : "OTHER");
        dto.setRoomType(product.getRoomType() != null ? product.getRoomType().toString() : "UNKNOWN");
        dto.setAestheticStyle(product.getAestheticStyle() != null ? product.getAestheticStyle().toString() : "UNKNOWN");
        return dto;
    }
}