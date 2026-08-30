import path from 'path';
import crypto from 'crypto';

/**
 * BR-22: Sanitizes original filename for disk storage while preserving
 * extension and maintaining the original filename untouched in DB metadata.
 * Format: {UUID}-{sanitizedBaseName}.{ext}
 */
export function sanitizeStoredFilename(originalFilename: string, customPrefix?: string): string {
  const ext = path.extname(originalFilename);
  const baseName = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const prefix = customPrefix ?? crypto.randomUUID();
  return `${prefix}-${baseName}${ext}`;
}

