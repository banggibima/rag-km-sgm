import express, { type Request, type Response } from "express";
import { insertOne, insertMany, insertFromJSON } from "./command";
import { query } from "./query";

const app = express();
app.use(express.json());

const port = process.env.PORT!;

app.post("/insert-one", async (req: Request, res: Response) => {
  try {
    await insertOne(req.body);
    res.json({ message: "Inserted one document" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/insert-many", async (req: Request, res: Response) => {
  try {
    await insertMany(req.body);
    res.json({ message: "Inserted many documents" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/insert-json", async (req: Request, res: Response) => {
  try {
    const { path } = req.body;
    await insertFromJSON(path);
    res.json({ message: `Inserted documents from ${path}` });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/query", async (req: Request, res: Response) => {
  try {
    const { text, topK } = req.body;
    const results = await query(text, topK || 3);
    res.json(results);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
