const CLIENTS_API = '/api/clients'
const CLIENT_STORAGE_KEY = 'zhordz-client'

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

function toClientSession(client) {
  if (!client) return null
  return {
    ...client,
    uid: client.id,
    displayName: client.name,
  }
}

function getStoredClient() {
  try {
    return toClientSession(JSON.parse(localStorage.getItem(CLIENT_STORAGE_KEY) || 'null'))
  } catch {
    return null
  }
}

function saveClient(client) {
  localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(client))
  window.dispatchEvent(new Event('zhordz-client-change'))
}

function clearClient() {
  localStorage.removeItem(CLIENT_STORAGE_KEY)
  window.dispatchEvent(new Event('zhordz-client-change'))
}

export function subscribeCurrentClient(callback) {
  const emit = () => callback(getStoredClient())
  emit()
  window.addEventListener('storage', emit)
  window.addEventListener('zhordz-client-change', emit)

  return () => {
    window.removeEventListener('storage', emit)
    window.removeEventListener('zhordz-client-change', emit)
  }
}

export async function registerClient({ name, email, phone, password }) {
  const client = await requestJson(CLIENTS_API, {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password }),
  })
  saveClient(client)
  return toClientSession(client)
}

export async function loginClient(email, password) {
  const client = await requestJson(`${CLIENTS_API}?action=login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  saveClient(client)
  return toClientSession(client)
}

export async function logoutClient() {
  clearClient()
}

export function subscribeClients(callback, onError) {
  let isActive = true
  let timeoutId

  const load = async () => {
    try {
      const clients = await requestJson(CLIENTS_API)
      if (isActive) callback(clients)
    } catch (error) {
      console.error('Failed to load clients:', error)
      if (onError) onError(error)
    } finally {
      if (isActive) timeoutId = window.setTimeout(load, 5000)
    }
  }

  load()

  return () => {
    isActive = false
    if (timeoutId) window.clearTimeout(timeoutId)
  }
}
