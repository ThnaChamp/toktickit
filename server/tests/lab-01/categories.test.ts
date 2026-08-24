import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/index.js';

describe('GET /api/categories', () => {
  it('returns categories from the database', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    expect(res.body.data.length).toBeGreaterThan(0);

    expect(res.body.data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
      })
    );

    expect(res.body.data.map((c: { name: string }) => c.name)).toEqual([
      'Account and Access', 'Hardware', 'Network', 'Software'
    ]);
  });
});
