// Every backend endpoint the app uses, grouped by area.
// Each function returns a Promise of the parsed JSON (see request()).

import { request } from './client'

export { ApiError, API_BASE_URL, UNAUTHORIZED_EVENT } from './client'

export const authApi = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (form) => request('/api/auth/register', { method: 'POST', body: form }),
}

export const productsApi = {
  list: (opts) => request('/api/products', opts),
  get: (id, opts) => request(`/api/products/${id}`, opts),
  search: (keyword, opts) => request('/api/products/search', { ...opts, query: { keyword } }),
  byCategory: (category, opts) => request(`/api/products/category/${category}`, opts),
  forRoom: (roomType, opts) => request(`/api/room-builder/products/${roomType}`, opts),
}

export const cartApi = {
  get: (opts) => request('/api/cart', opts),
  /** @param {{itemId:number, itemType:'PRODUCT'|'BUNDLE'|'CUSTOM_ROOM', quantity?:number}} item */
  add: ({ itemId, itemType = 'PRODUCT', quantity = 1 }) =>
    request('/api/cart/add', { method: 'POST', body: { itemId, itemType, quantity } }),
  remove: (cartItemId) => request(`/api/cart/remove/${cartItemId}`, { method: 'DELETE' }),
  clear: () => request('/api/cart/clear', { method: 'DELETE' }),
}

export const ordersApi = {
  /** Turns the user's cart into a PENDING order. */
  create: () => request('/api/order/create', { method: 'POST' }),
  list: (opts) => request('/api/order', opts),
  get: (orderId, opts) => request(`/api/order/${orderId}`, opts),
}

export const paymentsApi = {
  /** The server charges the order's own total; no amount is sent. */
  pay: (orderId, gatewayType) => request('/api/payment/process', { method: 'POST', body: { orderId, gatewayType } }),
}

export const roomsApi = {
  build: (room) => request('/api/room-builder/build', { method: 'POST', body: room }),
  list: (opts) => request('/api/room-builder', opts),
  addToCart: (roomId, quantity = 1) =>
    request(`/api/room-builder/${roomId}/add-to-cart`, { method: 'POST', body: { quantity } }),
}

export const quizApi = {
  submit: (style, roomType) => request('/api/design-quiz/submit', { method: 'POST', body: { style, roomType } }),
  /** The user's latest quiz result, or null if they haven't taken it. */
  latest: (opts) => request('/api/design-quiz/latest', opts),
}

export const designersApi = {
  list: (opts) => request('/api/designers', opts),
}
