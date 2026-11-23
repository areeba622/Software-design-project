package com.palette.palette.services;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.palette.palette.dto.CustomRoomResponseDTO;
import com.palette.palette.dto.RoomBuilderRequestDTO;
import com.palette.palette.entities.CustomRoom;
import com.palette.palette.entities.Product;
import com.palette.palette.entities.User;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.patterns.builder.RoomBuilder;
import com.palette.palette.repository.CartRepository;
import com.palette.palette.repository.CustomRoomRepository;
import com.palette.palette.repository.ProductRepository;
import com.palette.palette.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Room Builder: turns the user's choices into a {@link CustomRoom} using the
 * {@link RoomBuilder} (Builder pattern).
 *
 * <p>Prices always come from the catalogue. The builder prices each product with
 * a {@link com.palette.palette.patterns.strategy.PricingStrategy} (Strategy pattern):
 * flooring per sq ft of floor, wallpaper per sq ft of wall, furniture per item.</p>
 */
@Service
@RequiredArgsConstructor
public class RoomBuilderService {

    private final CustomRoomRepository customRoomRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;

    @Transactional
    public CustomRoomResponseDTO buildRoom(Long userId, RoomBuilderRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        CustomRoom room = assemble(dto);
        room.setUser(user);
        return toResponseDTO(customRoomRepository.save(room));
    }

    /**
     * Rebuilds the room in place, keeping its id, so a room that is already in
     * the cart stays in the cart (with the new price).
     */
    @Transactional
    public CustomRoomResponseDTO updateRoom(Long roomId, Long userId, RoomBuilderRequestDTO dto) {
        CustomRoom existing = findOwnedRoom(roomId, userId);
        CustomRoom rebuilt = assemble(dto);

        existing.setRoomType(rebuilt.getRoomType());
        existing.setWidth(rebuilt.getWidth());
        existing.setLength(rebuilt.getLength());
        existing.setFlooring(rebuilt.getFlooring());
        existing.setWallpaper(rebuilt.getWallpaper());
        existing.getFurnitureItems().clear();
        existing.getFurnitureItems().addAll(rebuilt.getFurnitureItems());
        existing.setTotalPrice(rebuilt.getTotalPrice());
        return toResponseDTO(existing);
    }

    @Transactional(readOnly = true)
    public CustomRoomResponseDTO getRoomById(Long roomId, Long userId) {
        return toResponseDTO(findOwnedRoom(roomId, userId));
    }

    @Transactional(readOnly = true)
    public List<CustomRoomResponseDTO> getUserRooms(Long userId) {
        return customRoomRepository.findByUserId(userId).stream().map(this::toResponseDTO).toList();
    }

    /** Deletes the room and takes it out of the owner's cart first. */
    @Transactional
    public void deleteRoom(Long roomId, Long userId) {
        CustomRoom room = findOwnedRoom(roomId, userId);
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().removeIf(line -> line.getCustomRoom() != null && roomId.equals(line.getCustomRoom().getId()));
            cartRepository.flush(); // delete the cart lines before the room they point at
        });
        customRoomRepository.delete(room);
    }

    // ── Builder pattern in action ────────────────────────────────────────────

    /** Loads the chosen products and lets the {@link RoomBuilder} assemble and price the room. */
    private CustomRoom assemble(RoomBuilderRequestDTO dto) {
        String roomType = ECommerceService.parseEnum(Product.RoomType.class, dto.getRoomType(), "room type").name();
        RoomBuilder builder = new RoomBuilder(roomType, dto.getWidth(), dto.getLength());

        if (dto.getFlooringProductId() != null) {
            builder.withFlooring(loadProduct(dto.getFlooringProductId(), "flooring"));
        }
        if (dto.getWallpaperProductId() != null) {
            builder.withWallpaper(loadProduct(dto.getWallpaperProductId(), "wallpaper"));
        }

        Map<Long, Product> furniture = productRepository.findAllById(dto.getFurnitureProductIds()).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        for (Long id : dto.getFurnitureProductIds()) {
            Product piece = furniture.get(id);
            if (piece == null) {
                throw new IllegalArgumentException("Furniture product " + id + " does not exist.");
            }
            builder.addFurniture(piece);
        }

        return builder.build();
    }

    private Product loadProduct(Long id, String label) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("The chosen " + label + " (product " + id + ") does not exist."));
    }

    private CustomRoom findOwnedRoom(Long roomId, Long userId) {
        return customRoomRepository.findByIdAndUserId(roomId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Custom room not found with id: " + roomId));
    }

    private CustomRoomResponseDTO toResponseDTO(CustomRoom room) {
        CustomRoomResponseDTO dto = new CustomRoomResponseDTO();
        dto.setRoomId(room.getId());
        dto.setUserId(room.getUser() != null ? room.getUser().getId() : null);
        dto.setRoomType(room.getRoomType());
        dto.setWidth(room.getWidth());
        dto.setLength(room.getLength());
        dto.setFlooring(room.getFlooring());
        dto.setWallpaper(room.getWallpaper());
        dto.setFurnitureItems(List.copyOf(room.getFurnitureItems()));
        dto.setTotalPrice(room.getTotalPrice());
        dto.setCreatedAt(room.getCreatedAt());
        return dto;
    }
}
