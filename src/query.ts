import { MongoClient } from "mongodb";
import { generateEmbedding } from "./embed.js";

const client = new MongoClient(process.env.MONGODB_URI!);
const dbName = process.env.DB_NAME!;
const collectionName = process.env.COLLECTION_NAME!;

export async function query(text: string) {
  const collection = client.db(dbName).collection(collectionName);
  const embedding = await generateEmbedding(text);

  const results = await collection
    .aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: embedding,
          numCandidates: 100,
          limit: 5,
        },
      },
      {
        $project: {
          text: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ])
    .toArray();

  return results;
}
