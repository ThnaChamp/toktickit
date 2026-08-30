import path from 'path';

/**
 * BR-22: Sanitizes original filename for disk storage while preserving
 * extension and maintaining the original filename untouched in DB metadata.
 * Format: attachment-{timestamp}-{sanitizedBaseName}.{ext}
 */
export function sanitizeStoredFilename(originalFilename: string, timestamp: number = Date.now()): string {
  const ext = path.extname(originalFilename);
  const baseName = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `attachment-${timestamp}-${baseName}${ext}`;
}

