import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('API-09 to API-14: GET /api/tickets (Issue 4 My Tickets)', () => {
  let requesterAId: number;
  let requesterBId: number;
  let hardwareCatId: number;
  let softwareCatId: number;
  let relatedSystemId: number;

  beforeAll(async () => {
    // 1. ดึง Requesters มา 2 คน เพื่อใช้เทสเรื่อง Ownership (คนละคนกัน)
    const reqRes = await request(app).get('/api/requesters');
    requesterAId = reqRes.body.data[0].id;
    requesterBId = reqRes.body.data[1].id;

    // 2. ดึง Categories
    const catRes = await request(app).get('/api/categories');
    const hw = catRes.body.data.find((c: { name: string }) => c.name === 'Hardware');
    const sw = catRes.body.data.find((c: { name: string }) => c.name === 'Software');
    hardwareCatId = hw ? hw.id : catRes.body.data[0].id;
    softwareCatId = sw ? sw.id : catRes.body.data[1].id;

    // 3. ดึง Related System
    const sysRes = await request(app).get('/api/related-systems');
    relatedSystemId = sysRes.body.data[0].id;

    // 4. สร้าง Seed Tickets สำหรับการทดสอบ (ของ Requester A)
    await request(app).post('/api/tickets').send({
      requesterId: requesterAId,
      categoryId: hardwareCatId,
      relatedSystemId,
      requestedPriority: 'HIGH',
      summary: 'Special Laptop screen broken',
      description: 'The screen is completely shattered and needs urgent replacement.',
    });

    await request(app).post('/api/tickets').send({
      requesterId: requesterAId,
      categoryId: softwareCatId,
      relatedSystemId,
      requestedPriority: 'LOW',
      summary: 'Update Zoom software',
      description: 'Need assistance installing the latest version of Zoom for meetings.',
    });

    // 5. สร้าง Ticket ของ Requester B
    await request(app).post('/api/tickets').send({
      requesterId: requesterBId,
      categoryId: hardwareCatId,
      relatedSystemId,
      requestedPriority: 'MEDIUM',
      summary: 'Requester B private ticket',
      description: 'This ticket belongs to Requester B and must not be visible to A.',
    });
  });

  // ─── API-09: Ownership Check (BR-06) ───────────────────────────────────────
  it('API-09: should only return tickets belonging to the specified requesterId', async () => {
    const res = await request(app).get(`/api/tickets?requesterId=${requesterAId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const tickets = res.body.data.tickets;
    expect(tickets.length).toBeGreaterThanOrEqual(2);

    // ตั๋วทุกใบต้องเป็นของ Requester A เท่านั้น
    for (const t of tickets) {
      expect(t.requesterId).toBe(requesterAId);
      expect(t.summary).not.toBe('Requester B private ticket');
    }
  });

  it('should return 400 MISSING_REQUESTER if requesterId is omitted', async () => {
    const res = await request(app).get('/api/tickets');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MISSING_REQUESTER');
  });

  // ─── API-10: Search (BR-26) ────────────────────────────────────────────────
  it('API-10: should filter tickets by search query (case-insensitive substring)', async () => {
    // ค้นหาคำว่า "laptop" (ตัวพิมพ์เล็ก แต่ใน DB คือ "Special Laptop...")
    const res = await request(app).get(`/api/tickets?requesterId=${requesterAId}&search=laptop`);

    expect(res.status).toBe(200);
    const tickets = res.body.data.tickets;
    expect(tickets.length).toBeGreaterThanOrEqual(1);

    for (const t of tickets) {
      const match = t.summary.toLowerCase().includes('laptop') || t.ticketNumber.toLowerCase().includes('laptop');
      expect(match).toBe(true);
    }
  });

  // ─── API-11: Filter by Category ────────────────────────────────────────────
  it('API-11: should filter tickets by Category name', async () => {
    const res = await request(app).get(`/api/tickets?requesterId=${requesterAId}&category=Hardware`);

    expect(res.status).toBe(200);
    const tickets = res.body.data.tickets;
    expect(tickets.length).toBeGreaterThanOrEqual(1);

    for (const t of tickets) {
      expect(t.category.name).toBe('Hardware');
    }
  });

  // ─── API-12: Default Sort (BR-23) ──────────────────────────────────────────
  it('API-12: should sort by createdAt DESC by default', async () => {
    const res = await request(app).get(`/api/tickets?requesterId=${requesterAId}`);

    expect(res.status).toBe(200);
    const tickets = res.body.data.tickets;
    if (tickets.length >= 2) {
      const time1 = new Date(tickets[0].createdAt).getTime();
      const time2 = new Date(tickets[1].createdAt).getTime();
      expect(time1).toBeGreaterThanOrEqual(time2);
    }
  });

  // ─── API-13: Pagination Parameters & Metadata (BR-24) ──────────────────────
  it('API-13: should return correct pagination structure and respect page/pageSize', async () => {
    const res = await request(app).get(`/api/tickets?requesterId=${requesterAId}&page=1&pageSize=10`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('pagination');
    const { pagination } = res.body.data;

    expect(pagination.page).toBe(1);
    expect(pagination.pageSize).toBe(10);
    expect(typeof pagination.totalItems).toBe('number');
    expect(typeof pagination.totalPages).toBe('number');
  });

  // ─── API-14: Invalid Page Size (BR-25) ─────────────────────────────────────
  it('API-14: should return 400 INVALID_PAGE_SIZE if pageSize is not 10, 25, or 50', async () => {
    const res = await request(app).get(`/api/tickets?requesterId=${requesterAId}&pageSize=99`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_PAGE_SIZE');
  });
});

