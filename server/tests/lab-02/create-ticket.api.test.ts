import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('API-01 to API-08: POST /api/tickets (Issue 3 Create Ticket)', () => {
  let validRequesterId: number;
  let validCategoryId: number;
  let validRelatedSystemId: number;

  beforeAll(async () => {
    // ดึง reference data ที่มีอยู่ใน DB มาใช้เทส
    const reqRes = await request(app).get('/api/requesters');
    validRequesterId = reqRes.body.data[0].id;

    const catRes = await request(app).get('/api/categories');
    validCategoryId = catRes.body.data[0].id;

    const sysRes = await request(app).get('/api/related-systems');
    validRelatedSystemId = sysRes.body.data[0].id;
  });

  // ─── API-01: Valid Ticket Creation ─────────────────────────────────────────
  it('API-01: should return 201 Created with official ticketNumber when valid data is submitted', async () => {
    const payload = {
      requesterId: validRequesterId,
      categoryId: validCategoryId,
      relatedSystemId: validRelatedSystemId,
      requestedPriority: 'MEDIUM',
      summary: 'Cannot connect to campus Wi-Fi',
      description: 'Since this morning my laptop fails to connect to the campus Wi-Fi network.',
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('ticketNumber');
    expect(res.body.data.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(res.body.data.requesterId).toBe(validRequesterId);
    expect(res.body.data.summary).toBe(payload.summary);
  });

  // ─── API-02 & API-03: Summary Validations ──────────────────────────────────
  it('API-02: should return 400 Bad Request if summary is empty', async () => {
    const payload = {
      requesterId: validRequesterId,
      categoryId: validCategoryId,
      relatedSystemId: validRelatedSystemId,
      requestedPriority: 'MEDIUM',
      summary: '   ',
      description: 'Valid description with more than 10 characters long.',
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const summaryErr = res.body.error.details.find((d: { field: string }) => d.field === 'summary');
    expect(summaryErr).toBeDefined();
  });

  it('API-03: should return 400 Bad Request if summary is less than 5 characters', async () => {
    const payload = {
      requesterId: validRequesterId,
      categoryId: validCategoryId,
      relatedSystemId: validRelatedSystemId,
      requestedPriority: 'MEDIUM',
      summary: 'Help', // 4 chars
      description: 'Valid description with more than 10 characters long.',
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    const summaryErr = res.body.error.details.find((d: { field: string }) => d.field === 'summary');
    expect(summaryErr).toBeDefined();
  });

  // ─── API-04: Description Validation ────────────────────────────────────────
  it('API-04: should return 400 Bad Request if description is less than 10 characters', async () => {
    const payload = {
      requesterId: validRequesterId,
      categoryId: validCategoryId,
      relatedSystemId: validRelatedSystemId,
      requestedPriority: 'MEDIUM',
      summary: 'Valid summary text',
      description: 'Short', // 5 chars
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    const descErr = res.body.error.details.find((d: { field: string }) => d.field === 'description');
    expect(descErr).toBeDefined();
  });

  // ─── API-05: Category Validation ───────────────────────────────────────────
  it('API-05: should return 400 Bad Request if categoryId does not exist', async () => {
    const payload = {
      requesterId: validRequesterId,
      categoryId: 99999, // non-existent
      relatedSystemId: validRelatedSystemId,
      requestedPriority: 'MEDIUM',
      summary: 'Valid summary text',
      description: 'Valid description with more than 10 characters long.',
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ─── API-06: Priority Validation ───────────────────────────────────────────
  it('API-06: should return 400 Bad Request if requestedPriority is invalid', async () => {
    const payload = {
      requesterId: validRequesterId,
      categoryId: validCategoryId,
      relatedSystemId: validRelatedSystemId,
      requestedPriority: 'URGENT_CRITICAL', // invalid enum
      summary: 'Valid summary text',
      description: 'Valid description with more than 10 characters long.',
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ─── API-07: Default Status is NEW (BR-02) ─────────────────────────────────
  it('API-07: should set initial currentStatus to NEW', async () => {
    const payload = {
      requesterId: validRequesterId,
      categoryId: validCategoryId,
      relatedSystemId: validRelatedSystemId,
      requestedPriority: 'LOW',
      summary: 'Default status check',
      description: 'Checking that newly created ticket always starts in NEW status.',
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.currentStatus).toBe('NEW');
  });

  // ─── API-08: itPriority defaults to requestedPriority (BR-12) ───────────────
  it('API-08: should initialize itPriority to match requestedPriority', async () => {
    const payload = {
      requesterId: validRequesterId,
      categoryId: validCategoryId,
      relatedSystemId: validRelatedSystemId,
      requestedPriority: 'HIGH',
      summary: 'IT priority initialization check',
      description: 'Checking that itPriority automatically copies requestedPriority upon creation.',
    };

    const res = await request(app).post('/api/tickets').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.itPriority).toBe('HIGH');
    expect(res.body.data.itPriority).toBe(res.body.data.requestedPriority);
  });
});

