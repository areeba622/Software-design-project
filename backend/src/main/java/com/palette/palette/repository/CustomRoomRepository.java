package com.palette.palette.repository;

import com.palette.palette.entities.CustomRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for {@link CustomRoom} entity.
 * Provides data access methods for custom room persistence operations.
 */
@Repository
public interface CustomRoomRepository extends JpaRepository<CustomRoom, Long> {

    /**
     * Retrieves all custom rooms belonging to a specific user.
     *
     * @param userId the ID of the user whose rooms are to be retrieved
     * @return a list of {@link CustomRoom} objects owned by the user;
     *         returns an empty list if none are found
     */
    List<CustomRoom> findByUserId(Long userId);

    /**
     * Retrieves a specific custom room by its ID, scoped to a particular user.
     * Ensures that a user can only access rooms they own.
     *
     * @param roomId the ID of the custom room
     * @param userId the ID of the user who must own the room
     * @return an {@link Optional} containing the {@link CustomRoom} if found and owned by the user,
     *         or an empty {@link Optional} if not found
     */
    Optional<CustomRoom> findByIdAndUserId(Long roomId, Long userId);
}
