import { MongoClient } from 'mongodb'

// Try direct shard connection string (bypassing SRV lookup)
const uri = 'mongodb://zhordz:bennaci2026@ac-bhmmb7z-shard-00-00.xamdu0v.mongodb.net:27017,ac-bhmmb7z-shard-00-01.xamdu0v.mongodb.net:27017,ac-bhmmb7z-shard-00-02.xamdu0v.mongodb.net:27017/zhordz?ssl=true&authSource=admin'

async function test() {
  try {
    console.log('Connecting to MongoDB Shards directly...')
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    })
    await client.connect()
    console.log('Successfully connected to MongoDB directly!')
    const db = client.db('zhordz')
    const collections = await db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    await client.close()
  } catch (err) {
    console.error('Connection failed:', err)
  }
}

test()
