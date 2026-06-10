package com.palette.palette.services;

import com.palette.palette.dto.CustomRoomResponseDTO;
import com.palette.palette.dto.RoomBuilderRequestDTO;
import com.palette.palette.entities.CustomRoom;
import com.palette.palette.entities.User;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.patterns.builder.RoomBuilder;
import com.palette.palette.repository.CustomRoomRepository;
import com.palette.palette.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class responsible for orchestrating the custom room building process.
 *
 * <p>This service acts as the bridge between the controller layer and the
 * {@link RoomBuilder} design pattern. It validates business rules, delegates
 * room assembly to {@link RoomBuilder}, persists results, and maps entities
 * to DTOs.</p>
 *
 * <p><b>Builder Pattern integration flow:</b></p>
 * <ol>
 * <li>Validate that the requesting user exists.</li>
 * <li>Create a {@link RoomBuilder} with mandatory Step 1 data (roomType, width, length).</li>
 * <li>Optionally call {@code setFlooring()} if flooring data is present.</li>
 * <li>Call {@code addFurniture()} for each furniture item.</li>
 * <li>Call {@code build()} — the builder validates all constraints and calculates the price.</li>
 * <li>Associate the compiled {@link CustomRoom} with the user and persist to the database.</li>
 * </ol>
 */
@Service
public class RoomBuilderService {

    private final CustomRoomRepository customRoomRepository;
    private final UserRepository userRepository;

    /**
     * Constructs a {@code RoomBuilderService} with its required dependencies.
     *
     * @param customRoomRepository the repository for {@link CustomRoom} persistence
     * @param userRepository       the repository used to validate user existence
     */
    public RoomBuilderService(CustomRoomRepository customRoomRepository,
                              UserRepository userRepository) {
        this.customRoomRepository = customRoomRepository;
        this.userRepository = userRepository;
    }

    // -------------------------------------------------------------------------
    // a) buildRoom — create and persist a new custom room
    // -------------------------------------------------------------------------

    /**
     * Builds and persists a new {@link CustomRoom} for the given user using the Builder Pattern.
     *
     * <p>The method delegates validation and price calculation to {@link RoomBuilder#build()}.
     * The resulting room is then associated with the authenticated user and saved to the database.</p>
     *
     * @param userId the ID of the user requesting the room build
     * @param dto    the request body containing room configuration details
     * @return a {@link CustomRoomResponseDTO} representing the newly created room
     * @throws ResourceNotFoundException if no user exists with the given {@code userId}
     * @throws IllegalArgumentException  if the builder rejects the input (e.g., missing furniture,
     * invalid dimensions)
     */
    @Transactional
    public CustomRoomResponseDTO buildRoom(Long userId, RoomBuilderRequestDTO dto) {
        // Step 0: Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        // Step 1: Initialise builder with mandatory fields (roomType, width, length)
        RoomBuilder builder;
        try {
            builder = new RoomBuilder(dto.getRoomType(), dto.getWidth(), dto.getLength());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid room dimensions: " + ex.getMessage());
        }

        // Step 2: Optionally apply flooring
        String flooring = dto.getFlooring();
        if (flooring != null && !flooring.isBlank()) {
            builder.setFlooring(flooring);
        }

        // Step 3: Add furniture items
        if (dto.getFurnitureItems() != null) {
            for (String item : dto.getFurnitureItems()) {
                builder.addFurniture(item);
            }
        }

        // Final: Build — validates constraints and calculates totalPrice
        CustomRoom room;
        try {
            room = builder.build();
        } catch (IllegalStateException ex) {
            throw new IllegalArgumentException("Room build failed: " + ex.getMessage());
        }

        // Associate room with the authenticated user and persist
        room.setUser(user);
        CustomRoom saved = customRoomRepository.save(room);

        return toResponseDTO(saved);
    }

    // -------------------------------------------------------------------------
    // b) getRoomById — retrieve a single room with user-ownership validation
    // -------------------------------------------------------------------------

    /**
     * Retrieves a specific custom room by its ID, ensuring it belongs to the requesting user.
     *
     * @param roomId the ID of the custom room to retrieve
     * @param userId the ID of the user who must own the room
     * @return a {@link CustomRoomResponseDTO} for the matching room
     * @throws ResourceNotFoundException if no room with the given ID exists for this user
     */
    @Transactional(readOnly = true)
    public CustomRoomResponseDTO getRoomById(Long roomId, Long userId) {
        CustomRoom room = customRoomRepository.findByIdAndUserId(roomId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Custom room not found with ID: " + roomId + " for user: " + userId));

        return toResponseDTO(room);
    }

    // -------------------------------------------------------------------------
    // c) getUserRooms — retrieve all rooms for a user
    // -------------------------------------------------------------------------

    /**
     * Retrieves all custom rooms belonging to the specified user.
     *
     * @param userId the ID of the user whose rooms are to be retrieved
     * @return a list of {@link CustomRoomResponseDTO} objects; empty if the user has no rooms
     * @throws ResourceNotFoundException if no user exists with the given {@code userId}
     */
    @Transactional(readOnly = true)
    public List<CustomRoomResponseDTO> getUserRooms(Long userId) {
        // Verify the user exists before querying their rooms
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }

        List<CustomRoom> rooms = customRoomRepository.findByUserId(userId);
        return rooms.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // d) updateRoom — replace an existing room with a newly built one
    // -------------------------------------------------------------------------

    /**
     * Updates an existing custom room by deleting it and rebuilding it using the Builder Pattern.
     *
     * <p>Ownership is validated before any modification. The old room is deleted and a fresh
     * {@link CustomRoom} is compiled from the provided DTO, ensuring price recalculation.</p>
     *
     * @param roomId the ID of the room to update
     * @param userId the ID of the user who must own the room
     * @param dto    the updated room configuration
     * @return a {@link CustomRoomResponseDTO} representing the newly rebuilt room
     * @throws ResourceNotFoundException if the room does not exist or does not belong to the user
     * @throws IllegalArgumentException  if the builder rejects the updated configuration
     */
    @Transactional
    public CustomRoomResponseDTO updateRoom(Long roomId, Long userId, RoomBuilderRequestDTO dto) {
        // Validate ownership — throws if not found or not owned by this user
        CustomRoom existingRoom = customRoomRepository.findByIdAndUserId(roomId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Custom room not found with ID: " + roomId + " for user: " + userId));

        // Delete the old room before rebuilding
        customRoomRepository.delete(existingRoom);
        customRoomRepository.flush(); // ensure deletion is committed before re-insert

        // Rebuild using the same buildRoom flow (which also validates user)
        return buildRoom(userId, dto);
    }

    // -------------------------------------------------------------------------
    // e) deleteRoom — remove a room with user-ownership validation
    // -------------------------------------------------------------------------

    /**
     * Deletes a custom room by its ID after validating that it belongs to the requesting user.
     *
     * @param roomId the ID of the room to delete
     * @param userId the ID of the user who must own the room
     * @throws ResourceNotFoundException if no room with the given ID exists for this user
     */
    @Transactional
    public void deleteRoom(Long roomId, Long userId) {
        CustomRoom room = customRoomRepository.findByIdAndUserId(roomId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Custom room not found with ID: " + roomId + " for user: " + userId));

        customRoomRepository.delete(room);
    }

    // -------------------------------------------------------------------------
    // Private helper — entity to DTO mapping
    // -------------------------------------------------------------------------

    /**
     * Maps a {@link CustomRoom} entity to a {@link CustomRoomResponseDTO}.
     *
     * @param room the {@link CustomRoom} entity to convert
     * @return the corresponding {@link CustomRoomResponseDTO}
     */
    private CustomRoomResponseDTO toResponseDTO(CustomRoom room) {
        CustomRoomResponseDTO dto = new CustomRoomResponseDTO();
        dto.setRoomId(room.getId());
        dto.setUserId(room.getUser() != null ? room.getUser().getId() : null);
        dto.setRoomType(room.getRoomType());
        dto.setWidth(room.getWidth());
        dto.setLength(room.getLength());
        dto.setFlooring(room.getFlooring());
        dto.setFurnitureItems(room.getFurnitureItems());
        dto.setTotalPrice(room.getTotalPrice());
        dto.setCreatedAt(room.getCreatedAt());
        return dto;
    }
}
