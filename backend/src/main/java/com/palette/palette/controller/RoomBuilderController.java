package com.palette.palette.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.CartItemRequestDTO;
import com.palette.palette.dto.CartResponseDTO;
import com.palette.palette.dto.CustomRoomResponseDTO;
import com.palette.palette.dto.ProductDTO;
import com.palette.palette.dto.RoomBuilderRequestDTO;
import com.palette.palette.security.CurrentUserId;
import com.palette.palette.services.CartManager;
import com.palette.palette.services.ECommerceService;
import com.palette.palette.services.RoomBuilderService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

/** Build, edit and buy custom rooms. All room endpoints act on the logged-in user's rooms. */
@RestController
@RequestMapping("/api/room-builder")
@RequiredArgsConstructor
public class RoomBuilderController {

    private final RoomBuilderService roomBuilderService;
    private final CartManager cartManager;
    private final ECommerceService eCommerceService;

    public record AddToCartRequest(@Min(1) @Max(99) Integer quantity) {
    }

    @PostMapping("/build")
    @ResponseStatus(HttpStatus.CREATED)
    public CustomRoomResponseDTO buildRoom(@CurrentUserId Long userId,
                                           @Valid @RequestBody RoomBuilderRequestDTO dto) {
        return roomBuilderService.buildRoom(userId, dto);
    }

    @GetMapping
    public List<CustomRoomResponseDTO> getMyRooms(@CurrentUserId Long userId) {
        return roomBuilderService.getUserRooms(userId);
    }

    @GetMapping("/{roomId}")
    public CustomRoomResponseDTO getRoomById(@CurrentUserId Long userId, @PathVariable Long roomId) {
        return roomBuilderService.getRoomById(roomId, userId);
    }

    @PatchMapping("/{roomId}")
    public CustomRoomResponseDTO updateRoom(@CurrentUserId Long userId, @PathVariable Long roomId,
                                            @Valid @RequestBody RoomBuilderRequestDTO dto) {
        return roomBuilderService.updateRoom(roomId, userId, dto);
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@CurrentUserId Long userId, @PathVariable Long roomId) {
        roomBuilderService.deleteRoom(roomId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{roomId}/add-to-cart")
    @ResponseStatus(HttpStatus.CREATED)
    public CartResponseDTO addToCart(@CurrentUserId Long userId, @PathVariable Long roomId,
                                     @Valid @RequestBody(required = false) AddToCartRequest body) {
        int quantity = body != null && body.quantity() != null ? body.quantity() : 1;
        return cartManager.addItemToCart(userId, new CartItemRequestDTO(roomId, quantity, "CUSTOM_ROOM"));
    }

    /** Public: the furniture you can pick for a room type, grouped by style then name. */
    @GetMapping("/products/{roomType}")
    public List<ProductDTO> getProductsByRoomType(@PathVariable String roomType) {
        return eCommerceService.getProductsByRoomType(roomType);
    }
}
