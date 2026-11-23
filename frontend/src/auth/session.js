// Where the logged-in user (and their token) is kept between page loads.

const SESSION_KEY = 'palette_user'

/** The saved user, or null. Sessions from before JWT login (no token) are ignored. */
export function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY))
    return saved?.token ? saved : null
  } catch {
    return null
  }
}

export function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch {
    // storage blocked (e.g. private mode): the session just won't survive a reload
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}
