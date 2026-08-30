import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('API-27: GET /api/requesters (Issue 2 Requester Context)', () => {
  it('should return 200 OK with only active requesters (inactive Alex Turner must be excluded)', async () => {
    const res = await request(app).get('/api/requesters');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    // ตรวจสอบว่ามี Requester ส่งกลับมา
    const requesters = res.body.data;
    expect(requesters.length).toBeGreaterThan(0);

    // ตรวจสอบว่าไม่มี Alex Turner (inactive requester per BR-04 / API-27)
    const alex = requesters.find((r: { name: string; email: string }) => 
      r.name === 'Alex Turner' || r.email === 'alex.turner@example.com'
    );
    expect(alex).toBeUndefined();

    // ตรวจสอบโครงสร้างของแต่ละ object มี id, name, email
    for (const r of requesters) {
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('name');
      expect(r).toHaveProperty('email');
    }
  });

  it('should return 200 OK for GET /api/categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 200 OK for GET /api/related-systems', async () => {
    const res = await request(app).get('/api/related-systems');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

