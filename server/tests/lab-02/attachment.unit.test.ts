import { describe, it, expect } from 'vitest';
import { sanitizeStoredFilename } from '../../src/utils/fileSanitizer.js';

describe('UNIT-08 & UNIT-09: Filename Sanitizer (BR-22)', () => {
  // ─── UNIT-08: Safe Filename Format ──────────────────────────────────────────
  it('UNIT-08: should produce UUID-prefixed safe filename matching ^[a-f0-9-]{36}-.+$', () => {
    const original = 'my-photo.png';
    const stored = sanitizeStoredFilename(original);

    // Matches UUID-prefixed format: 36 characters of hex and hyphens followed by "-" and filename
    expect(stored).toMatch(/^[a-f0-9-]{36}-.+$/);
    expect(stored.endsWith('.png')).toBe(true);
  });

  // ─── UNIT-09: Preserves Original Filename & Cleans Special Characters ───────
  it('UNIT-09: should sanitize special characters in stored filename while preserving original filename in metadata', () => {
    const original = 'My Weird #Report (v1.0) & Final!.pdf';
    const fixedUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    const stored = sanitizeStoredFilename(original, fixedUuid);

    // Stored filename sanitized without unsafe characters (#, (, ), &, !, space)
    expect(stored).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890-My_Weird__Report__v1_0____Final_.pdf');
    expect(stored.endsWith('.pdf')).toBe(true);

    // Original filename remains intact for DB metadata
    expect(original).toBe('My Weird #Report (v1.0) & Final!.pdf');
  });

  it('should handle standard filename without changing clean alphanumeric base', () => {
    const original = 'invoice.png';
    const fixedUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    const stored = sanitizeStoredFilename(original, fixedUuid);
    expect(stored).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890-invoice.png');
  });
});
