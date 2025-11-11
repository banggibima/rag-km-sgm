import { MongoClient } from "mongodb";
import { promises as fs } from "fs";
import type { DocumentDTO } from "./dto/document.dto";

const client = new MongoClient(process.env.MONGODB_URI!);
const dbName = process.env.DB_NAME!;
const collectionName = process.env.COLLECTION_NAME!;


async function connectDB() {
  await client.connect();
  console.log("Connected to MongoDB");
  return client.db(dbName).collection(collectionName);
}

export async function insertOne(doc: DocumentDTO) {
  const collection = await connectDB();

  try {
    const result = await collection.insertOne(doc);
    console.log(`Inserted one document with _id: ${result.insertedId}`);
  } catch (err) {
    console.error("Error inserting document:", (err as Error).message);
  }
}

export async function insertMany(docs: DocumentDTO[]) {
  const collection = await connectDB();

  try {
    const result = await collection.insertMany(docs);
    console.log(`Inserted ${result.insertedCount} documents`);
  } catch (err) {
    throw new Error(`Failed to insert documents: ${(err as Error).message}`);
  }
}

export async function insertFromFile(filePath: string) {
  const collection = await connectDB();

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    const docs = Array.isArray(data) ? data : [data];

    const result = await collection.insertMany(docs);
    console.log(`Inserted ${result.insertedCount} documents from file: ${filePath}`);
  } catch (err) {
    throw new Error(`Failed to read JSON file: ${(err as Error).message}`);
  } finally {
    try {
      await fs.unlink(filePath);
      console.log(`Deleted temporary file: ${filePath}`);
    } catch {
      console.warn(`Could not delete temp file: ${filePath}`);
    }
  }
}
