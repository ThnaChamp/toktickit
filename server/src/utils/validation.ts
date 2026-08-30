export interface ValidationError {
  field: string;
  message: string;
}

/**
 * BR-07: Summary is required, trimmed of whitespace, between 5 and 200 characters.
 */
export function validateSummary(summary: unknown): ValidationError | null {
  const trimmed = typeof summary === 'string' ? summary.trim() : '';
  if (trimmed.length < 5 || trimmed.length > 200) {
    return {
      field: 'summary',
      message: 'Summary must be between 5 and 200 characters.',
    };
  }
  return null;
}

/**
 * BR-08: Description is required, trimmed of whitespace, between 10 and 3000 characters.
 */
export function validateDescription(description: unknown): ValidationError | null {
  const trimmed = typeof description === 'string' ? description.trim() : '';
  if (trimmed.length < 10 || trimmed.length > 3000) {
    return {
      field: 'description',
      message: 'Description must be between 10 and 3000 characters.',
    };
  }
  return null;
}
