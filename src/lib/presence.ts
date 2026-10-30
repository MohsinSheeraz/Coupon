import clientPromise from "@/lib/mongodb"

const PRESENCE_TTL_SECONDS = 600
let presenceIndexPromise: Promise<string> | undefined

async function getPresenceCollection() {
    const client = await clientPromise
    const collection = client.db("DealzyCoup").collection<{ _id: string; lastSeenAt: Date }>("visitor_presence")
    if (!presenceIndexPromise) {
        const indexCreation = collection.createIndex(
            { lastSeenAt: 1 },
            { expireAfterSeconds: PRESENCE_TTL_SECONDS },
        )
        presenceIndexPromise = indexCreation.catch((error: unknown) => {
            presenceIndexPromise = undefined
            throw error
        })
    }
    await presenceIndexPromise
    return collection
}

export async function recordVisitorPresence(visitorId: string) {
    const collection = await getPresenceCollection()
    await collection.updateOne(
        { _id: visitorId },
        { $set: { lastSeenAt: new Date() } },
        { upsert: true },
    )
}

export async function countActiveVisitors(windowMinutes = 3) {
    const collection = await getPresenceCollection()
    const activeSince = new Date(Date.now() - windowMinutes * 60 * 1000)
    return collection.countDocuments({ lastSeenAt: { $gte: activeSince } })
}
