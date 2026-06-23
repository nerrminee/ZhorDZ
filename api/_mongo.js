import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI_ENV = 'MONGODB_URI'
const dbName = process.env.MONGODB_DB || 'zhordz'

let cachedClient
let cachedDb

export function validateMongoEnv() {
  const uri = process.env[MONGODB_URI_ENV]

  if (!uri) {
    const error = new Error(
      [
        `Missing ${MONGODB_URI_ENV} environment variable.`,
        `Create a .env file in ${process.cwd()} with ${MONGODB_URI_ENV}=<your MongoDB Atlas connection string>.`,
      ].join(' '),
    )
    error.code = `MISSING_${MONGODB_URI_ENV}`
    console.error(`[config] ${error.message}`)
    throw error
  }

  return uri
}

export async function getDb() {
  const uri = validateMongoEnv()

  if (cachedDb) return cachedDb

  cachedClient = cachedClient || new MongoClient(uri)
  await cachedClient.connect()
  cachedDb = cachedClient.db(dbName)
  return cachedDb
}

export function toPublicDoc(doc) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return {
    id: String(_id),
    ...rest,
  }
}

export function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error('Invalid document id')
    error.statusCode = 400
    throw error
  }

  return new ObjectId(id)
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

export function sendJson(res, statusCode, data) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export function handleError(req, res, error) {
  const statusCode = error.statusCode || 500
  const stackLines = error.stack ? error.stack.split('\n').map((line) => line.trim()) : []

  console.error('[api] Request failed', {
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode,
    message: error.message,
    code: error.code,
    stack: error.stack,
  })

  sendJson(res, statusCode, {
    error: error.message || 'Server error',
    code: error.code || 'SERVER_ERROR',
    method: req.method,
    url: req.originalUrl || req.url,
    stack: stackLines,
  })
}
