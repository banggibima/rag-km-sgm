import { MongoClient } from "mongodb";
import { generateEmbedding } from "./embed";

const client = new MongoClient(process.env.MONGODB_URI!);
const dbName = process.env.DB_NAME!;
const collectionName = process.env.COLLECTION_NAME!;

async function connectDB() {
  await client.connect();
  console.log("Connected to MongoDB");
  return client.db(dbName).collection(collectionName);
}

export async function query(text: string, topK = 3) {
  const collection = await connectDB();

  console.log("Creating embedding for query...");
  const embedding = await generateEmbedding(text);

  console.log("Running vector search...");
  const results = await collection
    .aggregate([
      {
        $vectorSearch: {
          queryVector: embedding,
          path: "embedding",
          numCandidates: 100,
          limit: topK,
          index: "vector_index",
        },
      },
      {
        $project: {
          _id: 0,
          page_content: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ])
    .toArray();

  console.log(`Found ${results.length} results`);
  return results;
}
