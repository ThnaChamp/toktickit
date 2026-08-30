import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('API-15 to API-17: GET /api/tickets/:ticketNumber (Issue 5 Ticket Detail)', () => {
  let requesterAId: number;
  let requesterBId: number;
  let ticketNumberA: string;

  beforeAll(async () => {
    // 1. ดึง Requesters มา 2 คน เพื่อทดสอบ Ownership
    const reqRes = await request(app).get('/api/requesters');
    requesterAId = reqRes.body.data[0].id;
    requesterBId = reqRes.body.data[1].id;

    // 2. ดึง Categories & Systems
    const catRes = await request(app).get('/api/categories');
    const sysRes = await request(app).get('/api/related-systems');

    // 3. สร้างตั๋วสำหรับ Requester A
    const ticketRes = await request(app).post('/api/tickets').send({
      requesterId: requesterAId,
      categoryId: catRes.body.data[0].id,
      relatedSystemId: sysRes.body.data[0].id,
      requestedPriority: 'MEDIUM',
      summary: 'Detail Test Ticket',
      description: 'Testing ticket details retrieval and ownership enforcement.',
    });

    ticketNumberA = ticketRes.body.data.ticketNumber;
  });

  // ─── API-15: Ownership Check (Wrong Requester) ─────────────────────────────
  it('API-15: should return 403 FORBIDDEN when accessed by a different requester', async () => {
    const res = await request(app).get(`/api/tickets/${ticketNumberA}?requesterId=${requesterBId}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return 400 MISSING_REQUESTER when requesterId is not provided', async () => {
    const res = await request(app).get(`/api/tickets/${ticketNumberA}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MISSING_REQUESTER');
  });

  // ─── API-16: Correct Requester Access ──────────────────────────────────────
  it('API-16: should return 200 OK with full ticket details for the ticket owner', async () => {
    const res = await request(app).get(`/api/tickets/${ticketNumberA}?requesterId=${requesterAId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticketNumber).toBe(ticketNumberA);
    expect(res.body.data.summary).toBe('Detail Test Ticket');
    expect(res.body.data).toHaveProperty('category');
    expect(res.body.data).toHaveProperty('relatedSystem');
    expect(res.body.data).toHaveProperty('requester');
    expect(res.body.data).toHaveProperty('attachments');
    expect(Array.isArray(res.body.data.attachments)).toBe(true);
  });

  // ─── API-17: Non-existent Ticket ───────────────────────────────────────────
  it('API-17: should return 404 NOT_FOUND when ticket does not exist', async () => {
    const res = await request(app).get(`/api/tickets/TKT-0000-NOTEXIST?requesterId=${requesterAId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

