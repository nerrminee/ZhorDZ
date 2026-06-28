import { Router } from 'express'
import User from '../models/User.js'
import { createError } from '../middleware/errorHandler.js'
import { signToken, requireAuth } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validate.js'
import { verifyPassword } from '../utils/password.js'

const router = Router()

router.post('/login', async (req, res, next) => {
  try {
    validateRequest(
      {
        email: { required: true, type: 'email' },
        password: { required: true, minLength: 6 },
      },
      req.body
    )

    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    const user = await User.findOne({ email })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
    }

    const token = signToken({ sub: user.id, role: 'admin', email: user.email })

    res.status(200).json({
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    next(error)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401, 'UNAUTHORIZED')
    }

    const user = await User.findById(req.user.sub)
    if (!user) {
      throw createError('User not found', 404, 'NOT_FOUND')
    }

    res.status(200).json(user.toJSON())
  } catch (error) {
    next(error)
  }
})

export default router
