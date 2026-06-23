import { getDb, handleError, readBody, sendJson, toObjectId, toPublicDoc } from './_mongo.js'

const COLLECTION = 'orders'

export default async function handler(req, res) {
  try {
    const db = await getDb()
    const orders = db.collection(COLLECTION)
    const { searchParams } = new URL(req.url, 'http://localhost')
    const id = searchParams.get('id')

    if (req.method === 'GET') {
      const docs = await orders.find({}).sort({ createdAt: -1 }).toArray()
      sendJson(res, 200, docs.map(toPublicDoc))
      return
    }

    if (req.method === 'POST') {
      const body = await readBody(req)
      const payload = {
        ...body,
        status: body.status || 'new',
        paymentMethod: 'cash_on_delivery',
        createdAt: new Date(),
      }
      const result = await orders.insertOne(payload)
      sendJson(res, 201, toPublicDoc({ _id: result.insertedId, ...payload }))
      return
    }

    if (req.method === 'DELETE') {
      if (!id) {
        sendJson(res, 400, { error: 'Missing order id' })
        return
      }

      await orders.deleteOne({ _id: toObjectId(id) })
      sendJson(res, 200, { id })
      return
    }

    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    handleError(req, res, error)
  }
}
