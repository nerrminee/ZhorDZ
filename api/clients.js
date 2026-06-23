import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'
import { getDb, handleError, readBody, sendJson, toPublicDoc } from './_mongo.js'

const COLLECTION = 'clients'

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, storedHash = '') {
  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) return false

  const candidate = hashPassword(password, salt).split(':')[1]
  return timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'))
}

function publicClient(doc) {
  const client = toPublicDoc(doc)
  if (!client) return null
  delete client.passwordHash
  return client
}

export default async function handler(req, res) {
  try {
    const db = await getDb()
    const clients = db.collection(COLLECTION)
    const { searchParams } = new URL(req.url, 'http://localhost')
    const action = searchParams.get('action')

    if (req.method === 'GET') {
      const docs = await clients.find({}).sort({ createdAt: -1 }).toArray()
      sendJson(res, 200, docs.map(publicClient))
      return
    }

    if (req.method === 'POST' && action === 'login') {
      const body = await readBody(req)
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      const client = await clients.findOne({ email })

      if (!client || !verifyPassword(password, client.passwordHash)) {
        sendJson(res, 401, { error: 'Email ou mot de passe incorrect.' })
        return
      }

      sendJson(res, 200, publicClient(client))
      return
    }

    if (req.method === 'POST') {
      const body = await readBody(req)
      const name = String(body.name || '').trim()
      const email = String(body.email || '').trim().toLowerCase()
      const phone = String(body.phone || '').trim()
      const password = String(body.password || '')

      if (!name || !email || !phone || password.length < 6) {
        sendJson(res, 400, { error: 'Client payload is incomplete' })
        return
      }

      const existing = await clients.findOne({ email })
      if (existing) {
        sendJson(res, 409, { error: 'Cet email est deja utilise.' })
        return
      }

      const payload = {
        name,
        email,
        phone,
        passwordHash: hashPassword(password),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const result = await clients.insertOne(payload)

      sendJson(res, 201, publicClient({ _id: result.insertedId, ...payload }))
      return
    }

    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    handleError(res, error)
  }
}
