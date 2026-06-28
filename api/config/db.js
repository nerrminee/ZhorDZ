import mongoose from 'mongoose'

let cachedConnection = null

export async function connectToDatabase() {
  if (cachedConnection?.readyState === 1) {
    return cachedConnection
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in environment')
  }

  mongoose.set('strictQuery', true)
  cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || 'zhordz',
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })

  mongoose.connection.on('error', (error) => {
    console.error('[mongo] Connection error:', error)
  })

  return cachedConnection
}

export function getConnectionState() {
  return mongoose.connection.readyState
}
