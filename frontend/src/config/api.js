// frontend/src/config/api.js
// Centralized API configuration for Palette frontend

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,

  // Products & Bundles
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
  PRODUCTS_BY_CATEGORY: (category) => `${API_BASE_URL}/api/products/category/${category}`,
  PRODUCTS_SEARCH: `${API_BASE_URL}/api/products/search`,
  PRODUCTS_FILTER: `${API_BASE_URL}/api/products/filter`,
  PRODUCTS_STANDALONE: `${API_BASE_URL}/api/products/standalone`,
  BUNDLES: `${API_BASE_URL}/api/products/bundles`,
  BUNDLE_BY_ID: (id) => `${API_BASE_URL}/api/products/bundles/${id}`,
  BUNDLES_BY_ROOM: (roomType) => `${API_BASE_URL}/api/products/bundles/room/${roomType}`,

  // Cart
  CART: (userId) => `${API_BASE_URL}/api/cart?userId=${userId}`,
  CART_ADD: (userId) => `${API_BASE_URL}/api/cart/add?userId=${userId}`,
  CART_REMOVE: (cartItemId, userId) => `${API_BASE_URL}/api/cart/remove/${cartItemId}?userId=${userId}`,
  CART_CLEAR: (userId) => `${API_BASE_URL}/api/cart/clear?userId=${userId}`,

  // Orders
  ORDER_CREATE: `${API_BASE_URL}/api/order/create`,
  ORDERS_BY_USER: (userId) => `${API_BASE_URL}/api/order?userId=${userId}`,
  ORDER_BY_ID: (orderId, userId) => `${API_BASE_URL}/api/order/${orderId}?userId=${userId}`,

  // Payment
  PAYMENT_PROCESS: `${API_BASE_URL}/api/payment/process`,
  PAYMENT_BY_ORDER: (orderId) => `${API_BASE_URL}/api/payment/order/${orderId}`,

  // Room Builder
  ROOM_BUILD: (userId) => `${API_BASE_URL}/api/room-builder/build?userId=${userId}`,
  ROOM_GET: (roomId, userId) => `${API_BASE_URL}/api/room-builder/${roomId}?userId=${userId}`,
  ROOMS_BY_USER: (userId) => `${API_BASE_URL}/api/room-builder/user/${userId}`,
  ROOM_ADD_TO_CART: (roomId, userId) => `${API_BASE_URL}/api/room-builder/${roomId}/add-to-cart?userId=${userId}`,
  ROOM_PRODUCTS_BY_TYPE: (roomType) => `${API_BASE_URL}/api/room-builder/products/${roomType}`,

  
  // Design Quiz
QUIZ_SUBMIT: (userId) => userId
  ? `${API_BASE_URL}/api/design-quiz/submit?userId=${userId}`
  : `${API_BASE_URL}/api/design-quiz/submit`,

QUIZ_LATEST: (userId) =>
  `${API_BASE_URL}/api/design-quiz/latest?userId=${userId}`,

  // Designers
  DESIGNERS: `${API_BASE_URL}/api/designers`,
  DESIGNER_BY_ID: (id) => `${API_BASE_URL}/api/designers/${id}`,
};

export default API_BASE_URL;
