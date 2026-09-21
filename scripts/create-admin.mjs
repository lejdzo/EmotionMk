import argon2 from 'argon2'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const username = process.argv[2]
const password = process.argv[3]

if (!username || !password) {
  console.log('Usage: node scripts/create-admin.mjs <username> <password>')
  process.exit(1)
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME

if (!uri || !dbName) {
  throw new Error('Missing MONGODB_URI or MONGODB_DB_NAME')
}

const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
})

const client = new MongoClient(uri)
await client.connect()

const db = client.db(dbName)

await db.collection('users').updateOne(
  { username },
  {
    $set: {
      username,
      passwordHash,
      role: 'admin',
      active: true,
      updatedAt: new Date()
    }
  },
  { upsert: true }
)

console.log(`✅ Admin user '${username}' created/updated`)
await client.close()