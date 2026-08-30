import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('API-18 to API-26: Attachment Management (Issue 5)', () => {
  let requesterAId: number;
  let requesterBId: number;
  let ticketNumber: string;
  let createdAttachmentId: number;

  beforeAll(async () => {
    // 1. ดึง Requesters
    const reqRes = await request(app).get('/api/requesters');
    requesterAId = reqRes.body.data[0].id;
    requesterBId = reqRes.body.data[1].id;

    // 2. ดึง Categories & Systems
    const catRes = await request(app).get('/api/categories');
    const sysRes = await request(app).get('/api/related-systems');

    // 3. สร้าง Ticket สำหรับทดสอบ Upload File
    const ticketRes = await request(app).post('/api/tickets').send({
      requesterId: requesterAId,
      categoryId: catRes.body.data[0].id,
      relatedSystemId: sysRes.body.data[0].id,
      requestedPriority: 'HIGH',
      summary: 'Attachment Testing Ticket',
      description: 'Ticket used to test upload, download, and soft-removal of attachments.',
    });

    ticketNumber = ticketRes.body.data.ticketNumber;
  });

  // ─── API-21: Unsupported File Type (BR-16) ─────────────────────────────────
  it('API-21: should return 415 UNSUPPORTED_TYPE when uploading disallowed file type (e.g. .exe)', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketNumber}/attachments`)
      .field('requesterId', requesterAId)
      .attach('file', Buffer.from('malicious content'), 'malware.exe');

    expect(res.status).toBe(415);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNSUPPORTED_TYPE');
  });

  // ─── API-20: File Size > 5 MB (BR-17) ──────────────────────────────────────
  it('API-20: should return 413 FILE_TOO_LARGE when file exceeds 5 MB', async () => {
    // สร้าง Buffer ขนาด 5.5 MB (5.5 * 1024 * 1024 bytes)
    const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024, 0);

    const res = await request(app)
      .post(`/api/tickets/${ticketNumber}/attachments`)
      .field('requesterId', requesterAId)
      .attach('file', largeBuffer, 'large_file.png');

    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
  });

  // ─── API-18 & Upload Success: Upload up to 5 files ─────────────────────────
  it('API-18: should successfully upload valid files (JPG/PNG/WEBP/PDF <= 5 MB)', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketNumber}/attachments`)
      .field('requesterId', requesterAId)
      .attach('file', Buffer.from('%PDF-1.4 dummy pdf content'), 'document.pdf');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.originalFilename).toBe('document.pdf');
    expect(res.body.data.removedAt).toBeNull();

    createdAttachmentId = res.body.data.id;
  });

  // ─── API-22: Download Active Attachment (AC-19) ────────────────────────────
  it('API-22: should allow downloading active attachment with 200 OK and file bytes', async () => {
    const res = await request(app).get(
      `/api/attachments/${createdAttachmentId}/download?requesterId=${requesterAId}`
    );

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('attachment');
  });

  // ─── Ownership check for attachment download ──────────────────────────────
  it('should return 403 FORBIDDEN when downloading another requester attachment', async () => {
    const res = await request(app).get(
      `/api/attachments/${createdAttachmentId}/download?requesterId=${requesterBId}`
    );

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // ─── API-25: DELETE without removalReason (BR-19) ───────────────────────────
  it('API-25: should return 400 VALIDATION_ERROR when deleting without removalReason', async () => {
    const res = await request(app)
      .delete(`/api/attachments/${createdAttachmentId}`)
      .send({ requesterId: requesterAId, removalReason: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // ─── API-24: Soft-Removal (BR-19, BR-21, AC-20) ────────────────────────────
  it('API-24: should soft-remove attachment, storing removedAt and removalReason', async () => {
    const res = await request(app)
      .delete(`/api/attachments/${createdAttachmentId}`)
      .send({
        requesterId: requesterAId,
        removalReason: 'File contains sensitive credentials uploaded by mistake.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.removedAt).not.toBeNull();
    expect(res.body.data.removalReason).toBe(
      'File contains sensitive credentials uploaded by mistake.'
    );
  });

  // ─── API-26: Double Removal (ALREADY_REMOVED) ──────────────────────────────
  it('API-26: should return 409 ALREADY_REMOVED when deleting an already-removed attachment', async () => {
    const res = await request(app)
      .delete(`/api/attachments/${createdAttachmentId}`)
      .send({
        requesterId: requesterAId,
        removalReason: 'Trying to remove again.',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ALREADY_REMOVED');
  });

  // ─── API-23: Download Removed Attachment (BR-20, AC-21) ────────────────────
  it('API-23: should return 403 REMOVED when attempting to download soft-removed attachment', async () => {
    const res = await request(app).get(
      `/api/attachments/${createdAttachmentId}/download?requesterId=${requesterAId}`
    );

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('REMOVED');
  });

  // ─── API-19: Attachment Limit (Max 5 active) (BR-18, AC-18) ────────────────
  it('API-19: should return 409 ATTACHMENT_LIMIT when uploading more than 5 active attachments', async () => {
    // สร้างตั๋วใหม่สำหรับเทสลิมิต 5 ชิ้น
    const catRes = await request(app).get('/api/categories');
    const sysRes = await request(app).get('/api/related-systems');
    const limitTicketRes = await request(app).post('/api/tickets').send({
      requesterId: requesterAId,
      categoryId: catRes.body.data[0].id,
      relatedSystemId: sysRes.body.data[0].id,
      requestedPriority: 'LOW',
      summary: 'Limit Testing Ticket',
      description: 'Ticket used to test the 5 active attachments limit.',
    });

    const limitTicketNumber = limitTicketRes.body.data.ticketNumber;

    // อัปโหลด 5 ไฟล์รวด
    for (let i = 1; i <= 5; i++) {
      const uploadRes = await request(app)
        .post(`/api/tickets/${limitTicketNumber}/attachments`)
        .field('requesterId', requesterAId)
        .attach('file', Buffer.from(`file content ${i}`), `test_${i}.png`);

      expect(uploadRes.status).toBe(201);
    }

    // พยายามอัปโหลดไฟล์ที่ 6 -> ต้องได้ 409 ATTACHMENT_LIMIT
    const overflowRes = await request(app)
      .post(`/api/tickets/${limitTicketNumber}/attachments`)
      .field('requesterId', requesterAId)
      .attach('file', Buffer.from('file content 6'), 'test_6.png');

    expect(overflowRes.status).toBe(409);
    expect(overflowRes.body.success).toBe(false);
    expect(overflowRes.body.error.code).toBe('ATTACHMENT_LIMIT');
  });
});

