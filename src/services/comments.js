import { requestJson } from './apiClient.js'

const COMMENTS_API = '/api/comments'

export const addComment = async (client, message) => {
  return requestJson(COMMENTS_API, {
    method: 'POST',
    body: JSON.stringify({
      clientId: client.uid || client.id,
      clientName: client.displayName || client.name || client.email || 'Client',
      email: client.email,
      message,
    }),
  })
}

export const subscribeComments = (callback) => {
  let isActive = true
  let timeoutId

  const load = async () => {
    try {
      const comments = await requestJson(COMMENTS_API)
      if (isActive) callback(comments)
    } catch (error) {
      console.error('Error loading comments:', error)
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

export const deleteComment = async (commentId) => {
  await requestJson(`${COMMENTS_API}?id=${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  })
}
