import { Router } from 'express'
import Comment from '../models/Comment.js'
import { createError } from '../middleware/errorHandler.js'
import { validateRequest } from '../middleware/validate.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const comments = await Comment.find({}).sort({ createdAt: -1 })
    res.status(200).json(comments)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    validateRequest(
      {
        clientId: { required: true, type: 'string', minLength: 1 },
        clientName: { required: true, type: 'string', minLength: 2 },
        email: { required: true, type: 'email' },
        message: { required: true, type: 'string', minLength: 3 },
      },
      req.body
    )

    const comment = await Comment.create({
      clientId: String(req.body.clientId || '').trim(),
      clientName: String(req.body.clientName || '').trim(),
      email: String(req.body.email || '').trim().toLowerCase(),
      message: String(req.body.message || '').trim(),
    })

    res.status(201).json(comment)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id?', async (req, res, next) => {
  try {
    const { id } = req.params
    const commentId = id || req.query.id
    const comment = await Comment.findByIdAndDelete(commentId)

    if (!comment) {
      throw createError('Comment not found', 404, 'NOT_FOUND')
    }

    res.status(200).json({ id: commentId, deleted: true })
  } catch (error) {
    next(error)
  }
})

export default router
