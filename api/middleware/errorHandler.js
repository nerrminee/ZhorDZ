export function createError(message, statusCode = 500, code = 'SERVER_ERROR', details = null) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  error.details = details
  return error
}

export function handleApiError(req, res, error) {
  let statusCode = error?.statusCode || 500
  let code = error?.code || 'SERVER_ERROR'
  let details = error?.details || null

  if (error?.name === 'ValidationError' || error?.errors) {
    console.error('Mongoose ValidationError:', error.errors)
    statusCode = 400
    code = 'VALIDATION_ERROR'
    details = {}
    Object.keys(error.errors).forEach((key) => {
      details[key] = [error.errors[key].message]
    })
  }

  console.error(`[api] ${req.method} ${req.originalUrl || req.url} failed`, {
    statusCode,
    code,
    message: error?.message,
    details: details || error?.details,
  })

  const payload = {
    error: error?.message || 'Server error',
    code,
  }

  if (details) {
    payload.details = details
  }

  res.status(statusCode).json(payload)
}

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  return handleApiError(req, res, err)
}
