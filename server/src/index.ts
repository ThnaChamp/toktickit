import express, { type Request, type Response } from 'express';
import cors from 'cors'
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Create App Express
const app = express();
const PORT = 3000; // Define Port run Server

app.use(cors({
  origin: 'http://localhost:5173',
}))

// Create Endpoint GET /api/health
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        service: "TokTickIT API"
    });
});

app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    const response = categories.map((category) => ({
      id: category.id,
      name: category.name,
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch categories',
    });
  }
});

// Start the server and wait for connections
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`TokTickIT API is running on http://localhost:${PORT}`);
  });
}