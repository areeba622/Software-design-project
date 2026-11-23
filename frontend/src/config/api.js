// frontend/src/config/api.js
// Central API configuration + an authenticated fetch helper.
//
// The backend identifies the user from the JWT sent in the Authorization
// header, so no endpoint takes a userId any more.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

const SESSION_KEY = 'palette_user'

/** Fired on window when the server rejects our token; App.jsx logs the user out. */
export const UNAUTHORIZED_EVENT = 'palette:unauthorized'

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,

  // Products & bundles (public)
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
  PRODUCTS_BY_CATEGORY: (category) => `${API_BASE_URL}/api/products/category/${category}`,
  PRODUCTS_SEARCH: (keyword) => `${API_BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}`,
  PRODUCTS_FILTER: (maxPrice) => `${API_BASE_URL}/api/products/filter?maxPrice=${maxPrice}`,
  BUNDLES: `${API_BASE_URL}/api/products/bundles`,

  // Cart (logged-in user)
  CART: `${API_BASE_URL}/api/cart`,
  CART_ADD: `${API_BASE_URL}/api/cart/add`,
  CART_REMOVE: (cartItemId) => `${API_BASE_URL}/api/cart/remove/${cartItemId}`,
  CART_CLEAR: `${API_BASE_URL}/api/cart/clear`,

  // Orders (logged-in user)
  ORDER_CREATE: `${API_BASE_URL}/api/order/create`,
  ORDERS: `${API_BASE_URL}/api/order`,
  ORDER_BY_ID: (orderId) => `${API_BASE_URL}/api/order/${orderId}`,

  // Payment (logged-in user)
  PAYMENT_PROCESS: `${API_BASE_URL}/api/payment/process`,
  PAYMENT_BY_ORDER: (orderId) => `${API_BASE_URL}/api/payment/order/${orderId}`,

  // Room Builder
  ROOM_BUILD: `${API_BASE_URL}/api/room-builder/build`,
  ROOMS: `${API_BASE_URL}/api/room-builder`,
  ROOM_BY_ID: (roomId) => `${API_BASE_URL}/api/room-builder/${roomId}`,
  ROOM_ADD_TO_CART: (roomId) => `${API_BASE_URL}/api/room-builder/${roomId}/add-to-cart`,
  ROOM_PRODUCTS_BY_TYPE: (roomType) => `${API_BASE_URL}/api/room-builder/products/${roomType}`,

  // Design quiz (submit is open to guests; latest needs login)
  QUIZ_SUBMIT: `${API_BASE_URL}/api/design-quiz/submit`,
  QUIZ_LATEST: `${API_BASE_URL}/api/design-quiz/latest`,

  // Designers (public)
  DESIGNERS: `${API_BASE_URL}/api/designers`,
  DESIGNER_BY_ID: (id) => `${API_BASE_URL}/api/designers/${id}`,
}

/** Must match RoomBuilderService.WALL_HEIGHT_FT on the backend. */
export const WALL_HEIGHT_FT = 10

// ── Session ──────────────────────────────────────────────────────────────────

export function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY))
    return saved?.token ? saved : null // sessions from before JWT login have no token
  } catch {
    return null
  }
}

export function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch {
    // storage blocked (private mode): the session just won't survive a reload
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}

/**
 * fetch() that adds the login token and a JSON content type.
 * Returns the normal Response. On 401 it also tells the app to log out.
 */
export async function authFetch(url, options = {}) {
  const token = loadSession()?.token
  const headers = { ...(options.headers || {}) }
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(url, { ...options, headers })
  if (response.status === 401 && token) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
  return response
}

/** Reads the `message` from an error response, falling back to a default. */
export async function errorMessage(response, fallback = 'Something went wrong. Please try again.') {
  try {
    const body = await response.json()
    return body?.message || fallback
  } catch {
    return fallback
  }
}

export default API_BASE_URL
