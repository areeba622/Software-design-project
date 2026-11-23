// The one place the frontend talks to the backend.
//
// request() adds the login token, sends/reads JSON, and turns any non-2xx
// answer into an ApiError carrying the server's message. Pages never call
// fetch() directly.

import { loadSession } from '../auth/session'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

/** Fired on window when the server rejects our token; AuthProvider logs the user out. */
export const UNAUTHORIZED_EVENT = 'palette:unauthorized'

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/**
 * @param {string} path    e.g. '/api/cart'
 * @param {object} [opts]
 * @param {string} [opts.method='GET']
 * @param {object} [opts.body]     sent as JSON
 * @param {object} [opts.query]    added as ?key=value (undefined/null/'' skipped)
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<any>} parsed JSON, or null for an empty response
 */
export async function request(path, { method = 'GET', body, query, signal } = {}) {
  const url = new URL(path, API_BASE_URL)
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  })

  const token = loadSession()?.token
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, "Can't reach the Palette server. Check your connection and try again.")
  }

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    const message = (data && typeof data === 'object' && data.message) || defaultMessage(response.status)
    throw new ApiError(response.status, message, data)
  }
  return data
}

function defaultMessage(status) {
  if (status === 401) return 'Please log in to continue.'
  if (status === 403) return "You're not allowed to do that."
  if (status === 404) return "We couldn't find that."
  if (status >= 500) return 'Something went wrong on our side. Please try again.'
  return 'Something went wrong. Please try again.'
}
