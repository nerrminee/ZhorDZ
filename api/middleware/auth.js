import jwt from 'jsonwebtoken'
import { createError } from './errorHandler.js'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''

  if (!token) {
    req.user = null
    return next()
  }

  try {
    req.user = verifyToken(token)
    return next()
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'UNAUTHORIZED',
    })
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    })
  }

  return next()
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        code: 'FORBIDDEN',
      })
    }

    return next()
  }
}

export function createAuthError(message = 'Authentication failed', statusCode = 401) {
  return createError(message, statusCode, 'UNAUTHORIZED')
}
