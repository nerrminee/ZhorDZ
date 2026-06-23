import { getDb, handleError, readBody, sendJson, toObjectId, toPublicDoc } from './_mongo.js'

const COLLECTION = 'products'

export default async function handler(req, res) {
  try {
    const db = await getDb()
    const products = db.collection(COLLECTION)
    const { searchParams } = new URL(req.url, 'http://localhost')
    const id = searchParams.get('id')

    if (req.method === 'GET') {
      const docs = await products.find({}).sort({ createdAt: -1 }).toArray()
      sendJson(res, 200, docs.map(toPublicDoc))
      return
    }

    if (req.method === 'POST') {
      const body = await readBody(req)
      const payload = {
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const result = await products.insertOne(payload)
      sendJson(res, 201, toPublicDoc({ _id: result.insertedId, ...payload }))
      return
    }

    if (req.method === 'PUT') {
      if (!id) {
        sendJson(res, 400, { error: 'Missing product id' })
        return
      }

      const body = await readBody(req)
      const payload = {
        ...body,
        updatedAt: new Date(),
      }
      delete payload.id

      await products.updateOne({ _id: toObjectId(id) }, { $set: payload })
      const updated = await products.findOne({ _id: toObjectId(id) })
      sendJson(res, 200, toPublicDoc(updated))
      return
    }

    if (req.method === 'DELETE') {
      if (!id) {
        sendJson(res, 400, { error: 'Missing product id' })
        return
      }

      await products.deleteOne({ _id: toObjectId(id) })
      sendJson(res, 200, { id })
      return
    }

    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    handleError(req, res, error)
  }
}
