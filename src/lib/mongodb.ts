import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
if (!uri) throw new Error("Please add MONGODB_URI")

const options = { maxPoolSize: 5, serverSelectionTimeoutMS: 5000 }

const g = globalThis as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> }
if (!g._mongoClientPromise) {
    g._mongoClientPromise = new MongoClient(uri, options).connect()
}
const clientPromise = g._mongoClientPromise

export default clientPromise