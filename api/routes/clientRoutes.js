import { Router } from 'express'
import User from '../models/User.js'
import { createError } from '../middleware/errorHandler.js'
import { validateRequest } from '../middleware/validate.js'
import { hashPassword, verifyPassword } from '../utils/password.js'

const router = Router()

function serializeUser(user) {
  if (!user) return null
  return user.toJSON ? user.toJSON() : user
}

router.get('/', async (req, res, next) => {
  try {
    const clients = await User.find({}).sort({ createdAt: -1 })
    res.status(200).json(clients.map(serializeUser))
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const action = String(req.query.action || '').toLowerCase()

    if (action === 'login') {
      validateRequest(
        {
          email: { required: true, type: 'email' },
          password: { required: true, minLength: 6 },
        },
        req.body
      )

      const email = String(req.body.email || '').trim().toLowerCase()
      const password = String(req.body.password || '')
      const client = await User.findOne({ email })

      if (!client || !verifyPassword(password, client.passwordHash)) {
        throw createError('Email or password is incorrect', 401, 'INVALID_CREDENTIALS')
      }

      return res.status(200).json(serializeUser(client))
    }

    validateRequest(
      {
        name: { required: true, type: 'string', minLength: 2 },
        email: { required: true, type: 'email' },
        phone: { required: true, type: 'string', minLength: 6 },
        password: { required: true, minLength: 6 },
      },
      req.body
    )

    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const phone = String(req.body.phone || '').trim()
    const password = String(req.body.password || '')

    const existingClient = await User.findOne({ email })
    if (existingClient) {
      throw createError('This email is already in use', 409, 'EMAIL_ALREADY_EXISTS')
    }

    const client = await User.create({
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
    })

    return res.status(201).json(serializeUser(client))
  } catch (error) {
    next(error)
  }
})

export default router
