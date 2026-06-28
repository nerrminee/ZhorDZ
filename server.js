import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectToDatabase } from './api/config/db.js'
import { authenticate } from './api/middleware/auth.js'
import { errorHandler } from './api/middleware/errorHandler.js'
import authRoutes from './api/routes/authRoutes.js'
import clientRoutes from './api/routes/clientRoutes.js'
import productRoutes from './api/routes/productRoutes.js'
import commentRoutes from './api/routes/commentRoutes.js'
import orderRoutes from './api/routes/orderRoutes.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`)
  next()
})

app.use(authenticate)

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'ZhorDZ API Server is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/products', productRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/orders', orderRoutes)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' })
})

app.use(errorHandler)

async function startServer() {
  try {
    await connectToDatabase()
    console.log('MongoDB connection established')

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`API URL: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT} with DB connection failure.`)
    })
  }
}

startServer()
