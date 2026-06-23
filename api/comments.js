import { getDb, handleError, readBody, sendJson, toObjectId, toPublicDoc } from './_mongo.js'

const COLLECTION = 'comments'

export default async function handler(req, res) {
  try {
    const db = await getDb()
    const comments = db.collection(COLLECTION)
    const { searchParams } = new URL(req.url, 'http://localhost')
    const id = searchParams.get('id')

    if (req.method === 'GET') {
      const docs = await comments.find({}).sort({ createdAt: -1 }).toArray()
      sendJson(res, 200, docs.map(toPublicDoc))
      return
    }

    if (req.method === 'POST') {
      const body = await readBody(req)
      const payload = {
        clientId: String(body.clientId || '').trim(),
        clientName: String(body.clientName || '').trim(),
        email: String(body.email || '').trim().toLowerCase(),
        message: String(body.message || '').trim(),
        createdAt: new Date(),
      }

      if (!payload.clientId || !payload.clientName || !payload.email || !payload.message) {
        sendJson(res, 400, { error: 'Comment payload is incomplete' })
        return
      }

      const result = await comments.insertOne(payload)
      sendJson(res, 201, toPublicDoc({ _id: result.insertedId, ...payload }))
      return
    }

    if (req.method === 'DELETE') {
      if (!id) {
        sendJson(res, 400, { error: 'Missing comment id' })
        return
      }

      await comments.deleteOne({ _id: toObjectId(id) })
      sendJson(res, 200, { id })
      return
    }

    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    handleError(req, res, error)
  }
}
