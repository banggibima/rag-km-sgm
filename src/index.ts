import express, { type Request, type Response } from "express";
import { query } from "./query.js";
import { insertDocuments } from "./command.js";
import { insertFromFile } from "./load-json.js";

const app = express();
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.post("/query", async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const results = await query(text);
    res.json({ results });
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/command", async (req: Request, res: Response) => {
  try {
    const result = await insertDocuments(req.body);
    res.json(result);
  } catch (err: any) {
    console.error("Insert error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/load-json", async (req: Request, res: Response) => {
  try {
    const result = await insertFromFile("joshbersin_chunked_results.json");
    res.json(result);
  } catch (err: any) {
    console.error("Load JSON error:", err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT!;
app.listen(port, () => console.log(`Server running on port ${port}`));
