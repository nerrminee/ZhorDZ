import { MongoClient } from 'mongodb'

const uri = 'mongodb+srv://zhordz:bennaci2026@cluster0.xamdu0v.mongodb.net/zhordz?retryWrites=true&w=majority&appName=Cluster0'

async function test() {
  try {
    console.log('Connecting to MongoDB...')
    const client = new MongoClient(uri)
    await client.connect()
    console.log('Successfully connected to MongoDB!')
    const db = client.db('zhordz')
    const collections = await db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    await client.close()
  } catch (err) {
    console.error('Connection failed:', err)
  }
}

test()
