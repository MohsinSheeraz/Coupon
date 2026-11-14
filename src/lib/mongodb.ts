import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
    throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
    maxPoolSize: 5,
    minPoolSize: 0,
    maxIdleTimeMS: 60_000,
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 8_000,
}

// Reuse one client per runtime instance in ALL environments (dev HMR and prod).
const globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>
}

if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
        // don't cache a failed connection forever
        globalWithMongo._mongoClientPromise = undefined
        throw error
    })
}

const clientPromise: Promise<MongoClient> = globalWithMongo._mongoClientPromise

export default clientPromise