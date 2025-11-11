import "dotenv/config"
import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { insertOne, insertMany, insertFromFile } from "./command";
import { query } from "./query";

dotenv.config();

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

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "RAG KM SGM Knowledge Management API",
      version: "1.0.0",
      description: "API for uploading, embedding, and querying documents",
    },
  },
  apis: ["./src/index.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Metadata:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           example: "https://example.com/article"
 *         title:
 *           type: string
 *           example: "Sample Article"
 *         source_file:
 *           type: string
 *           example: "data.json"
 *         scraped_at:
 *           type: number
 *           example: 1762150123.3256266
 *
 *     DocumentDTO:
 *       type: object
 *       properties:
 *         page_content:
 *           type: string
 *           example: "The labor market has changed before our eyes..."
 *         metadata:
 *           $ref: "#/components/schemas/Metadata"
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           example: [-0.0284, 0.0145]
 */

/**
 * @swagger
 * /insert-one:
 *   post:
 *     summary: Insert a single document
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/DocumentDTO"
 *     responses:
 *       200:
 *         description: Successfully inserted document
 */
app.post("/insert-one", async (req: Request, res: Response) => {
  try {
    await insertOne(req.body);
    res.json({ message: "Inserted one document" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /insert-many:
 *   post:
 *     summary: Insert multiple documents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: "#/components/schemas/DocumentDTO"
 *     responses:
 *       200:
 *         description: Successfully inserted documents
 */
app.post("/insert-many", async (req: Request, res: Response) => {
  try {
    await insertMany(req.body);
    res.json({ message: "Inserted many documents" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /upload-json:
 *   post:
 *     summary: Upload JSON file containing documents
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File processed and inserted into MongoDB
 */
app.post("/upload-json", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    await insertFromFile(req.file.path);
    res.json({ message: `Inserted documents from ${req.file.originalname}` });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /query:
 *   post:
 *     summary: Perform a vector search query
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "What is the labor market trend?"
 *               topK:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Returns search results with similarity scores
 */
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
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});
