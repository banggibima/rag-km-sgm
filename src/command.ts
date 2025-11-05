import { MongoClient } from "mongodb";
import { generateEmbedding } from "./embed.js";

const client = new MongoClient(process.env.MONGODB_URI!);
const dbName = process.env.DB_NAME!;
const collectionName = process.env.COLLECTION_NAME!;

export async function insertDocuments(docs: any | any[]) {
  const collection = client.db(dbName).collection(collectionName);
  const inputDocs = Array.isArray(docs) ? docs : [docs];

  const processed = [];
  for (const doc of inputDocs) {
    if (!doc.page_content) continue;

    const embedding = await generateEmbedding(doc.page_content);
    processed.push({
      text: doc.page_content,
      embedding,
      metadata: doc.metadata || {},
    });
  }

  const result = await collection.insertMany(processed);
  return { insertedCount: result.insertedCount };
}
