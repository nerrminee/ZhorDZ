import { Router } from 'express'
import Product from '../models/Product.js'
import { createError } from '../middleware/errorHandler.js'
import { validateRequest } from '../middleware/validate.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 })
    res.status(200).json(products)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    validateRequest(
      {
        name: { required: true, type: 'string', minLength: 2 },
        description: { required: true, type: 'string', minLength: 5 },
        price: { required: true, type: 'number', min: 0 },
      },
      req.body
    )

    const payload = {
      ...req.body,
      slug: req.body.slug || String(req.body.name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      images: Array.isArray(req.body.images) ? req.body.images : [],
      sizes: Array.isArray(req.body.sizes) ? req.body.sizes : [],
      colors: Array.isArray(req.body.colors) ? req.body.colors : [],
      availability: req.body.availability || (req.body.isInStock === false ? 'rupture' : 'in-stock'),
      isInStock: req.body.isInStock !== undefined ? Boolean(req.body.isInStock) : true,
      isPublished: req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : true,
      price: Number(req.body.price) || 0,
      oldPrice: Number(req.body.oldPrice) || 0,
    }

    const product = await Product.create(payload)
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
})

router.put('/:id?', async (req, res, next) => {
  try {
    const { id } = req.params
    const productId = id || req.query.id
    const product = await Product.findById(productId)

    if (!product) {
      throw createError('Product not found', 404, 'NOT_FOUND')
    }

    const payload = { ...req.body }
    if (payload.price !== undefined) payload.price = Number(payload.price) || 0
    if (payload.oldPrice !== undefined) payload.oldPrice = Number(payload.oldPrice) || 0
    if (payload.isInStock !== undefined) payload.isInStock = Boolean(payload.isInStock)
    if (payload.isPublished !== undefined) payload.isPublished = Boolean(payload.isPublished)

    Object.assign(product, payload)
    await product.save()

    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id?', async (req, res, next) => {
  try {
    const { id } = req.params
    const productId = id || req.query.id
    const product = await Product.findByIdAndDelete(productId)

    if (!product) {
      throw createError('Product not found', 404, 'NOT_FOUND')
    }

    res.status(200).json({ id: productId, deleted: true })
  } catch (error) {
    next(error)
  }
})

export default router
