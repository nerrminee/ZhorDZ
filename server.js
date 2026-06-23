import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('dotenv').config()

const [
  { default: express },
  { default: cors },
  { default: mongoose },
  { default: clientsHandler },
  { default: productsHandler },
  { default: commentsHandler },
  { default: ordersHandler },
  { validateMongoEnv },
] = await Promise.all([
  import('express'),
  import('cors'),
  import('mongoose'),
  import('./api/clients.js'),
  import('./api/products.js'),
  import('./api/comments.js'),
  import('./api/orders.js'),
  import('./api/_mongo.js'),
])

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`)
  next()
})

// Route mappings to Vercel serverless handlers
app.all('/api/clients', (req, res) => clientsHandler(req, res))
app.all('/api/products', (req, res) => productsHandler(req, res))
app.all('/api/comments', (req, res) => commentsHandler(req, res))
app.all('/api/orders', (req, res) => ordersHandler(req, res))

// Add a health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ZhorDZ API Server is running' })
})

// Catch-all 404 for api
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` })
})

// Connect to MongoDB using Mongoose and start server
async function startServer() {
  let mongoUri

  try {
    mongoUri = validateMongoEnv()
  } catch {
    process.exit(1)
  }

  try {
    console.log('Connecting to MongoDB via Mongoose...')
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB || 'zhordz',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    })
    console.log('Successfully connected to MongoDB via Mongoose!')

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`API URL: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    // Don't crash immediately in local dev if MongoDB Atlas is timing out, so Vite proxy won't break entirely,
    // but log it heavily.
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT} with DB CONNECTION FAILURE.`)
      console.log('Please ensure your IP is whitelisted on MongoDB Atlas.')
    })
  }
}

startServer()
