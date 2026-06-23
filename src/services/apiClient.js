export async function requestJson(url, options = {}) {
  const method = options.method || 'GET'
  const requestInfo = { url, method }

  let response
  let responseBody

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    })
  } catch (error) {
    console.error('[api] Network request failed', {
      ...requestInfo,
      error: error.message,
    })
    throw error
  }

  const responseText = await response.text()

  try {
    responseBody = responseText ? JSON.parse(responseText) : {}
  } catch {
    responseBody = responseText
  }

  if (!response.ok) {
    console.error('[api] Request failed', {
      ...requestInfo,
      status: response.status,
      responseBody,
    })

    const message =
      typeof responseBody === 'object' && responseBody !== null
        ? responseBody.error || responseBody.message || `Request failed with status ${response.status}`
        : responseBody || `Request failed with status ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.url = url
    error.method = method
    error.responseBody = responseBody
    throw error
  }

  return responseBody
}
