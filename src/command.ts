import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const dbName = process.env.DB_NAME!;
const collectionName = process.env.COLLECTION_NAME!;

async function connectDB() {
  await client.connect();
  console.log("Connected to MongoDB");
  return client.db(dbName).collection(collectionName);
}

export async function insertOne(doc: any) {
  const collection = await connectDB();
  const result = await collection.insertOne(doc);
  console.log(`Inserted one document with _id: ${result.insertedId}`);
}

export async function insertMany(docs: any[]) {
  const collection = await connectDB();
  const result = await collection.insertMany(docs);
  console.log(`Inserted ${result.insertedCount} documents`);
}

export async function insertFromJSON(filePath: string) {
  const collection = await connectDB();

  const file = Bun.file(filePath);
  const exists = await file.exists();
  if (!exists) throw new Error(`File not found: ${filePath}`);

  const data = await file.json();
  const docs = Array.isArray(data) ? data : [data];

  const result = await collection.insertMany(docs);
  console.log(`Inserted ${result.insertedCount} documents from ${filePath}`);
}
