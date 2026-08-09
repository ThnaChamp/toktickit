import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

const app = express();
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "TokTickIT API"
    });
});

describe('GET /api/health', () => {
    it('should return status 200 and correct json structure', async () => {
        const response = await request(app).get('/api/health');
        
        // Check HTTP Status is 200?
        expect(response.status).toBe(200);
        // Check JSON 
        expect(response.body).toEqual({
            status: "ok",
            service: "TokTickIT API"
        });
    });
});