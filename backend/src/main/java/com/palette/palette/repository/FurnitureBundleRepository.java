package com.palette.palette.repository;

import com.palette.palette.entities.FurnitureBundle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FurnitureBundleRepository extends JpaRepository<FurnitureBundle, Long> {

    // Find all bundles of a specific room type
    List<FurnitureBundle> findByRoomType(FurnitureBundle.RoomType roomType);

    // Find bundles within a price ceiling — used by Layer 2 quiz matching
    List<FurnitureBundle> findByTotalPriceInPKRLessThanEqual(Double maxPrice);

    // Find by aesthetic style name — used by Layer 2 factory
    List<FurnitureBundle> findByStyleName(String styleName);

    // Combined style + room type filter — core Layer 2 exact-match query
    List<FurnitureBundle> findByStyleNameAndRoomType(
            String styleName, FurnitureBundle.RoomType roomType);

    // Combined style + budget filter
    List<FurnitureBundle> findByStyleNameAndTotalPriceInPKRLessThanEqual(
            String styleName, Double maxPrice);
}