import "dotenv/config";
import express, { type Request, type Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { insertOne, insertMany, insertFromFile } from "./command";
import { query } from "./query";

const app = express();
app.use(express.json());

const port = process.env.PORT!;

const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

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

app.post("/upload-json", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    await insertFromFile(req.file.path);
    res.json({ message: `Inserted documents from ${req.file.originalname}` });
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
