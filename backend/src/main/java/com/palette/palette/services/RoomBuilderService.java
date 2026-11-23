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
 * <p>Pricing (all from catalogue prices, never from the client):</p>
 * <ul>
 *   <li>flooring: price per sq ft × floor area (width × length)</li>
 *   <li>wallpaper: price per sq ft × wall area (perimeter × {@value #WALL_HEIGHT_FT} ft)</li>
 *   <li>furniture: sum of the chosen products</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class RoomBuilderService {

    /** Standard ceiling height used to work out wall area. */
    public static final int WALL_HEIGHT_FT = 10;

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

    private CustomRoom assemble(RoomBuilderRequestDTO dto) {
        String roomType = ECommerceService.parseEnum(Product.RoomType.class, dto.getRoomType(), "room type").name();
        RoomBuilder builder = new RoomBuilder(roomType, dto.getWidth(), dto.getLength());

        double price = 0;

        if (dto.getFlooringProductId() != null) {
            Product flooring = loadProduct(dto.getFlooringProductId(), Product.ProductCategory.FLOORING, "flooring");
            builder.setFlooring(flooring.getName());
            price += flooring.getPrice() * floorArea(dto.getWidth(), dto.getLength());
        }

        if (dto.getWallpaperProductId() != null) {
            Product wallpaper = loadProduct(dto.getWallpaperProductId(), Product.ProductCategory.WALLPAPER, "wallpaper");
            builder.setWallpaper(wallpaper.getName());
            price += wallpaper.getPrice() * wallArea(dto.getWidth(), dto.getLength());
        }

        Map<Long, Product> furniture = productRepository.findAllById(dto.getFurnitureProductIds()).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        for (Long id : dto.getFurnitureProductIds()) {
            Product piece = furniture.get(id);
            if (piece == null) {
                throw new IllegalArgumentException("Furniture product " + id + " does not exist.");
            }
            builder.addFurniture(piece.getName());
            price += piece.getPrice();
        }

        return builder.setTotalPrice(Math.round(price * 100) / 100.0).build();
    }

    public static int floorArea(int width, int length) {
        return width * length;
    }

    public static int wallArea(int width, int length) {
        return 2 * (width + length) * WALL_HEIGHT_FT;
    }

    private Product loadProduct(Long id, Product.ProductCategory expected, String label) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("The chosen " + label + " (product " + id + ") does not exist."));
        if (product.getCategory() != expected) {
            throw new IllegalArgumentException("Product " + id + " is not a " + label + " product.");
        }
        return product;
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
