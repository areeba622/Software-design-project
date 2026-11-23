package com.palette.palette.dto;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Design a room. Flooring, wallpaper and furniture are chosen by product id,
 * so prices always come from the catalogue.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomBuilderRequestDTO {

    /** BEDROOM, LIVING_ROOM, KITCHEN, DINING_ROOM, ... */
    @NotBlank(message = "Room type is required")
    private String roomType;

    @NotNull(message = "Width is required")
    @Min(value = 1, message = "Width must be at least 1 foot")
    @Max(value = 100, message = "Width cannot exceed 100 feet")
    private Integer width;

    @NotNull(message = "Length is required")
    @Min(value = 1, message = "Length must be at least 1 foot")
    @Max(value = 100, message = "Length cannot exceed 100 feet")
    private Integer length;

    /** Optional: a FLOORING product. */
    private Long flooringProductId;

    /** Optional: a WALLPAPER product. */
    private Long wallpaperProductId;

    @NotEmpty(message = "Pick at least one piece of furniture")
    @Size(max = 30, message = "A room can have at most 30 furniture items")
    private List<@NotNull Long> furnitureProductIds;
}
