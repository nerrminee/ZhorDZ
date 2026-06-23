import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'zhordz'

let cachedClient
let cachedDb

export async function getDb() {
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable')
  }

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

export function handleError(res, error) {
  console.error(error)
  sendJson(res, error.statusCode || 500, {
    error: error.message || 'Server error',
  })
}
