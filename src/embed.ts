import { pipeline } from "@xenova/transformers";

let embedder: any;

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!embedder) {
    console.log("Loading embedding model...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Embedding model loaded");
  }

  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
