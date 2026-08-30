import { describe, it, expect } from 'vitest';
import { sanitizeStoredFilename } from '../../src/utils/fileSanitizer.js';

describe('UNIT-09: Filename Sanitizer (BR-22)', () => {
  it('UNIT-09: should sanitize special characters in stored filename while preserving extension and keeping original filename unchanged', () => {
    const original = 'My Weird #Report (v1.0) & Final!.pdf';
    const timestamp = 1718000000000;

    const stored = sanitizeStoredFilename(original, timestamp);

    // Stored filename must be sanitized without special characters (#, (, ), &, !, space)
    expect(stored).toBe('attachment-1718000000000-My_Weird__Report__v1_0____Final_.pdf');
    expect(stored.endsWith('.pdf')).toBe(true);

    // Original filename remains intact
    expect(original).toBe('My Weird #Report (v1.0) & Final!.pdf');
  });

  it('should handle standard filename without modification to alphanumeric base', () => {
    const original = 'invoice.png';
    const timestamp = 1718000000000;

    const stored = sanitizeStoredFilename(original, timestamp);
    expect(stored).toBe('attachment-1718000000000-invoice.png');
  });
});
