import express, { type Request, type Response } from 'express';
import cors from 'cors';
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = 3000;

export { app };
export default app;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, status: 'ok', service: 'TokTickIT API' });
});

// ─── GET /api/requesters — active Development Requesters only (BR-04) ─────────

app.get('/api/requesters', async (_req: Request, res: Response) => {
  try {
    const requesters = await prisma.requesterUser.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    });
    res.status(200).json({ success: true, data: requesters });
  } catch {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Unable to fetch requesters.' },
    });
  }
});

// ─── GET /api/categories — active categories only ─────────────────────────────

app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    res.status(200).json({ success: true, data: categories });
  } catch {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Unable to fetch categories.' },
    });
  }
});

// ─── GET /api/related-systems — active related systems only ───────────────────

app.get('/api/related-systems', async (_req: Request, res: Response) => {
  try {
    const systems = await prisma.relatedSystem.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    res.status(200).json({ success: true, data: systems });
  } catch {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Unable to fetch related systems.' },
    });
  }
});

// Start the server and wait for connections
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`TokTickIT API is running on http://localhost:${PORT}`);
  });
}