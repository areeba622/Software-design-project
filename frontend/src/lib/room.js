// Room size helpers. Same formulas as RoomDimensions on the backend.

/** Must match RoomDimensions.WALL_HEIGHT_FT on the backend. */
export const WALL_HEIGHT_FT = 10

export const floorArea = (width, length) => (width || 0) * (length || 0)

export const wallArea = (width, length) => 2 * ((width || 0) + (length || 0)) * WALL_HEIGHT_FT
