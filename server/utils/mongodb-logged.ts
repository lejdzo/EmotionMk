import type { FindOptions } from 'mongodb'
import { getMongoDb } from './mongodb'
import { logger } from './logger'

export async function loggedFind<T>(
  collectionName: string,
  query: any,
  options?: FindOptions
): Promise<T[]> {
  const start = Date.now()
  try {
    const mongoDb = await getMongoDb()
    const result = await mongoDb.collection(collectionName).find(query, options).toArray()

    const duration = Date.now() - start
    logger.database('FIND', collectionName, duration, true)
    logger.debug(`Found ${result.length} documents in ${collectionName}`)

    return result as T[]
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`Failed to find in ${collectionName}`, error, { duration })
    logger.database('FIND', collectionName, duration, false)
    throw error
  }
}

export async function loggedFindOne<T>(
  collectionName: string,
  query: any
): Promise<T | null> {
  const start = Date.now()
  try {
    const mongoDb = await getMongoDb()
    const result = await mongoDb.collection(collectionName).findOne(query)

    const duration = Date.now() - start
    logger.database('FIND_ONE', collectionName, duration, true)

    return (result as T) || null
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`Failed to findOne in ${collectionName}`, error, { duration })
    logger.database('FIND_ONE', collectionName, duration, false)
    throw error
  }
}

export async function loggedInsertOne(
  collectionName: string,
  document: any
): Promise<any> {
  const start = Date.now()
  try {
    const mongoDb = await getMongoDb()
    const result = await mongoDb.collection(collectionName).insertOne(document)

    const duration = Date.now() - start
    logger.database('INSERT', collectionName, duration, true)
    logger.debug(`Inserted document in ${collectionName}`, { duration })

    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`Failed to insert in ${collectionName}`, error, { duration })
    logger.database('INSERT', collectionName, duration, false)
    throw error
  }
}

export async function loggedUpdateOne(
  collectionName: string,
  filter: any,
  update: any
): Promise<any> {
  const start = Date.now()
  try {
    const mongoDb = await getMongoDb()
    const result = await mongoDb.collection(collectionName).updateOne(filter, update)

    const duration = Date.now() - start
    logger.database('UPDATE', collectionName, duration, true)
    logger.debug(`Updated ${result.modifiedCount} document(s) in ${collectionName}`, { duration })

    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`Failed to update in ${collectionName}`, error, { duration })
    logger.database('UPDATE', collectionName, duration, false)
    throw error
  }
}

export async function loggedDeleteOne(
  collectionName: string,
  filter: any
): Promise<any> {
  const start = Date.now()
  try {
    const mongoDb = await getMongoDb()
    const result = await mongoDb.collection(collectionName).deleteOne(filter)

    const duration = Date.now() - start
    logger.database('DELETE', collectionName, duration, true)
    logger.debug(`Deleted ${result.deletedCount} document(s) from ${collectionName}`, { duration })

    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`Failed to delete from ${collectionName}`, error, { duration })
    logger.database('DELETE', collectionName, duration, false)
    throw error
  }
}