import express, { type Request, type Response } from 'express';
import cors from 'cors';
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { generateTicketNumber } from './utils/ticketNumber.js';

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

// ─── POST /api/tickets ────────────────────────────────────────────────────────

app.post('/api/tickets', async (req: Request, res: Response) => {
  try {
    const {
      requesterId,
      categoryId,
      relatedSystemId,
      requestedPriority,
      summary,
      description,
    } = req.body;
    const errors: { field: string; message: string }[] = [];
    // --- Validation Rules ---
    // 1. ตรวจสอบ Requester
    if (!requesterId) {
      errors.push({ field: 'requesterId', message: 'Requester is required.' });
    } else {
      const requester = await prisma.requesterUser.findUnique({
        where: { id: Number(requesterId), isActive: true },
      });
      if (!requester) {
        errors.push({ field: 'requesterId', message: 'Active requester not found.' });
      }
    }
    // 2. ตรวจสอบ Category
    if (!categoryId) {
      errors.push({ field: 'categoryId', message: 'Category is required.' });
    } else {
      const category = await prisma.category.findUnique({
        where: { id: Number(categoryId), isActive: true },
      });
      if (!category) {
        errors.push({ field: 'categoryId', message: 'Active category not found.' });
      }
    }
    // 3. ตรวจสอบ Related System
    if (!relatedSystemId) {
      errors.push({ field: 'relatedSystemId', message: 'Related System is required.' });
    } else {
      const system = await prisma.relatedSystem.findUnique({
        where: { id: Number(relatedSystemId), isActive: true },
      });
      if (!system) {
        errors.push({ field: 'relatedSystemId', message: 'Active related system not found.' });
      }
    }
    // 4. ตรวจสอบ Priority
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    if (!requestedPriority || !validPriorities.includes(requestedPriority)) {
      errors.push({ field: 'requestedPriority', message: 'Requested priority must be LOW, MEDIUM, or HIGH.' });
    }
    // 5. ตรวจสอบ Summary (5 - 200 ตัวอักษร)
    const trimmedSummary = typeof summary === 'string' ? summary.trim() : '';
    if (trimmedSummary.length < 5 || trimmedSummary.length > 200) {
      errors.push({ field: 'summary', message: 'Summary must be between 5 and 200 characters.' });
    }
    // 6. ตรวจสอบ Description (10 - 3000 ตัวอักษร)
    const trimmedDescription = typeof description === 'string' ? description.trim() : '';
    if (trimmedDescription.length < 10 || trimmedDescription.length > 3000) {
      errors.push({ field: 'description', message: 'Description must be between 10 and 3000 characters.' });
    }
    // ถ้ามี Error แม้แต่อันเดียว ให้โยน 400 Bad Request กลับไป
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid ticket data.',
          details: errors,
        },
      });
    }
    // --- บันทึกลง Database (พร้อม Retry ป้องกัน Concurrency Race Condition) ---
    let newTicket;
    let attempts = 0;
    while (attempts < 5) {
      try {
        const ticketNumber = await generateTicketNumber(prisma);
        newTicket = await prisma.ticket.create({
          data: {
            ticketNumber,
            requesterId: Number(requesterId),
            categoryId: Number(categoryId),
            relatedSystemId: Number(relatedSystemId),
            requestedPriority,
            itPriority: requestedPriority, // BR-12: เริ่มต้นให้เท่ากับ requestedPriority
            currentStatus: 'NEW',          // BR-02: เริ่มต้นที่ NEW
            summary: trimmedSummary,
            description: trimmedDescription,
          },
          include: {
            category: { select: { id: true, name: true } },
            relatedSystem: { select: { id: true, name: true } },
          },
        });
        break;
      } catch (err: any) {
        if (err?.code === 'P2002' && attempts < 4) {
          attempts++;
          continue;
        }
        throw err;
      }
    }

    // ส่ง Response 201 Created กลับไป
    return res.status(201).json({
      success: true,
      data: newTicket,
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Unable to create ticket.' },
    });
  }
});

// ─── GET /api/tickets — My Tickets (Ownership + Search + Filter + Sort + Pagination) ───
app.get('/api/tickets', async (req: Request, res: Response) => {
  try {
    const {
      requesterId,
      search,
      category,
      requestedPriority,
      itPriority,
      status,
      sort = 'createdAt',
      order = 'desc',
      page = '1',
      pageSize = '10',
    } = req.query;

    // 1. ตรวจสอบ requesterId (BR-06: Ownership check)
    if (!requesterId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_REQUESTER', message: 'requesterId is required.' },
      });
    }

    const requester = await prisma.requesterUser.findUnique({
      where: { id: Number(requesterId), isActive: true },
    });
    if (!requester) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUESTER', message: 'Active requester not found.' },
      });
    }

    // 2. ตรวจสอบ Pagination parameters (BR-24, BR-25)
    const pageNum = parseInt(page as string, 10);
    const sizeNum = parseInt(pageSize as string, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAGE', message: 'page must be a positive integer.' },
      });
    }
    if (![10, 25, 50].includes(sizeNum)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAGE_SIZE', message: 'pageSize must be 10, 25, or 50.' },
      });
    }

    // 3. ตรวจสอบ Sorting parameters
    const allowedSortFields = ['ticketNumber', 'createdAt', 'updatedAt'];
    if (!allowedSortFields.includes(sort as string)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SORT', message: 'Invalid sort field.' },
      });
    }
    const sortOrder = (order as string).toLowerCase();
    if (!['asc', 'desc'].includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ORDER', message: 'order must be asc or desc.' },
      });
    }

    // 4. ประกอบเงื่อนไข Where Query (Prisma)
    const where: any = {
      requesterId: Number(requesterId), // 👈 ล็อกสิทธิ์เฉพาะของ Requester คนนี้เท่านั้น
    };

    // ค้นหาข้อความ (BR-26: summary หรือ ticketNumber แบบ Case-insensitive)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { summary: { contains: searchTerm, mode: 'insensitive' } },
        { ticketNumber: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Filter ตาม Category
    if (category && typeof category === 'string') {
      where.category = { name: category };
    }

    // Filter ตาม Requested Priority
    if (requestedPriority && typeof requestedPriority === 'string') {
      where.requestedPriority = requestedPriority;
    }

    // Filter ตาม IT Priority
    if (itPriority && typeof itPriority === 'string') {
      where.itPriority = itPriority;
    }

    // Filter ตาม Status
    if (status && typeof status === 'string') {
      where.currentStatus = status;
    }

    // 5. ดึงข้อมูลแบบ Pagination
    const totalItems = await prisma.ticket.count({ where });
    const totalPages = Math.ceil(totalItems / sizeNum) || 1;
    const skip = (pageNum - 1) * sizeNum;

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: {
        [sort as string]: sortOrder,
      },
      skip,
      take: sizeNum,
      include: {
        category: { select: { id: true, name: true } },
        relatedSystem: { select: { id: true, name: true } },
      },
    });

    // 6. ตอบกลับข้อมูล
    return res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: pageNum,
          pageSize: sizeNum,
          totalItems,
          totalPages,
        },
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Unable to fetch tickets.' },
    });
  }
});

// Start the server and wait for connections
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`TokTickIT API is running on http://localhost:${PORT}`);
  });
}

