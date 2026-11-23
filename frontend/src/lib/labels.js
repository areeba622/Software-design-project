// Turns backend enum values (LIVING_ROOM, SCANDINAVIAN…) into words people read.

export function titleCase(value) {
  if (!value) return ''
  return String(value)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const CATEGORY_PLURALS = {
  BED: 'Beds',
  CHAIR: 'Chairs',
  TABLE: 'Tables',
  LAMP: 'Lighting',
  RUG: 'Rugs',
  WARDROBE: 'Wardrobes',
  SOFA: 'Sofas',
  FLOORING: 'Flooring',
  WALLPAPER: 'Wallpaper',
  DECOR: 'Decor',
  OTHER: 'Other',
}

export const categoryLabel = (c) => CATEGORY_PLURALS[c] || titleCase(c)
/** LIVING_ROOM → "Living room" (sentence case, as in the rest of the interface). */
export const roomLabel = (r) => {
  const t = titleCase(r).toLowerCase()
  return t.charAt(0).toUpperCase() + t.slice(1)
}
export const styleLabel = titleCase

export const CATEGORIES = Object.keys(CATEGORY_PLURALS)
export const ROOMS = ['LIVING_ROOM', 'BEDROOM', 'DINING_ROOM', 'KITCHEN', 'OFFICE']
export const STYLES = ['MINIMALIST', 'SCANDINAVIAN', 'BOHEMIAN']

export const ITEM_TYPE_LABELS = {
  PRODUCT: 'Product',
  BUNDLE: 'Style bundle',
  CUSTOM_ROOM: 'Custom room',
  DESIGNER_HIRE: 'Designer',
}
