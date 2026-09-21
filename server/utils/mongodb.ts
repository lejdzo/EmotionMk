import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export async function getMongoDb(): Promise<Db> {
  if (db) return db

  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME

  if (!uri) throw new Error('Missing MONGODB_URI')
  if (!dbName) throw new Error('Missing MONGODB_DB_NAME')

  client = new MongoClient(uri)
  await client.connect()
  db = client.db(dbName)
  return db
}