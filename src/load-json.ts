import { insertDocuments } from "./command.js";

export async function insertFromFile(filePath: string) {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    throw new Error(`File not found: ${filePath}`);
  }

  console.log(`Reading JSON file: ${filePath}`);
  const jsonData = await file.json();

  if (!Array.isArray(jsonData)) {
    throw new Error("Invalid JSON format: expected an array");
  }

  console.log(`Found ${jsonData.length} items. Generating embeddings...`);
  const result = await insertDocuments(jsonData);

  console.log(`Inserted ${result.insertedCount} documents`);
  return result;
}
