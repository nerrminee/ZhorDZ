import { Router } from 'express'
import Order from '../models/Order.js'
import { createError } from '../middleware/errorHandler.js'
import { validateRequest } from '../middleware/validate.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 })
    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    validateRequest(
      {
        customer: { required: true, type: 'object' },
        items: { required: true, type: 'array' },
        total: { required: true, type: 'number', min: 0 },
      },
      req.body
    )

    const order = await Order.create({
      customer: req.body.customer || {},
      items: Array.isArray(req.body.items) ? req.body.items : [],
      subtotal: Number(req.body.subtotal) || 0,
      deliveryPrice: Number(req.body.deliveryPrice) || 0,
      total: Number(req.body.total) || 0,
      status: String(req.body.status || 'new').trim(),
      paymentMethod: String(req.body.paymentMethod || 'cash_on_delivery').trim(),
      shippingAddress: req.body.shippingAddress || {},
      notes: String(req.body.notes || req.body.customer?.note || '').trim(),
    })

    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id?', async (req, res, next) => {
  try {
    const { id } = req.params
    const orderId = id || req.query.id
    const order = await Order.findByIdAndDelete(orderId)

    if (!order) {
      throw createError('Order not found', 404, 'NOT_FOUND')
    }

    res.status(200).json({ id: orderId, deleted: true })
  } catch (error) {
    next(error)
  }
})

export default router
