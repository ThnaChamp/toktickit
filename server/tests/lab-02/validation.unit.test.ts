import { describe, it, expect } from 'vitest';
import { validateSummary, validateDescription } from '../../src/utils/validation.js';

describe('UNIT-03 to UNIT-07: Field Validation Boundaries (BR-07, BR-08)', () => {
  // ─── UNIT-03: Summary trimming ─────────────────────────────────────────────
  describe('Summary Validation (BR-07)', () => {
    it('UNIT-03: Summary trimming removes leading and trailing whitespace', () => {
      // Valid 5 chars surrounded by whitespace
      expect(validateSummary('   valid   ')).toBeNull();
      // Leading and trailing spaces trimmed resulting in < 5 chars
      expect(validateSummary('   abc   ')).toEqual({
        field: 'summary',
        message: 'Summary must be between 5 and 200 characters.',
      });
    });

    it('UNIT-04: should reject summary with fewer than 5 characters after trimming', () => {
      // 4 characters
      expect(validateSummary('abcd')).toEqual({
        field: 'summary',
        message: 'Summary must be between 5 and 200 characters.',
      });

      // Whitespace padding resulting in < 5 chars
      expect(validateSummary('   a   ')).toEqual({
        field: 'summary',
        message: 'Summary must be between 5 and 200 characters.',
      });

      // Empty string or only spaces
      expect(validateSummary('    ')).toEqual({
        field: 'summary',
        message: 'Summary must be between 5 and 200 characters.',
      });

      // Non-string input
      expect(validateSummary(null)).toEqual({
        field: 'summary',
        message: 'Summary must be between 5 and 200 characters.',
      });
    });

    // ─── UNIT-05: Summary > 200 chars ──────────────────────────────────────────
    it('UNIT-05: should reject summary with more than 200 characters', () => {
      const longSummary = 'a'.repeat(201);
      expect(validateSummary(longSummary)).toEqual({
        field: 'summary',
        message: 'Summary must be between 5 and 200 characters.',
      });
    });

    it('should accept valid summary between 5 and 200 characters', () => {
      // Exactly 5 characters
      expect(validateSummary('12345')).toBeNull();

      // Exactly 200 characters
      expect(validateSummary('a'.repeat(200))).toBeNull();

      // Normal string with leading/trailing spaces that trims to >= 5 chars
      expect(validateSummary('   Printer issue   ')).toBeNull();
    });
  });

  // ─── UNIT-06: Description < 10 chars after trim ───────────────────────────
  describe('Description Validation (BR-08)', () => {
    it('UNIT-06: should reject description with fewer than 10 characters after trimming', () => {
      // 9 characters
      expect(validateDescription('123456789')).toEqual({
        field: 'description',
        message: 'Description must be between 10 and 3000 characters.',
      });

      // Whitespace padding resulting in < 10 chars
      expect(validateDescription('   hello   ')).toEqual({
        field: 'description',
        message: 'Description must be between 10 and 3000 characters.',
      });

      // Empty string
      expect(validateDescription('')).toEqual({
        field: 'description',
        message: 'Description must be between 10 and 3000 characters.',
      });
    });

    // ─── UNIT-07: Description > 3000 chars ─────────────────────────────────────
    it('UNIT-07: should reject description with more than 3000 characters', () => {
      const longDescription = 'd'.repeat(3001);
      expect(validateDescription(longDescription)).toEqual({
        field: 'description',
        message: 'Description must be between 10 and 3000 characters.',
      });
    });

    it('should accept valid description between 10 and 3000 characters', () => {
      // Exactly 10 characters
      expect(validateDescription('1234567890')).toBeNull();

      // Exactly 3000 characters
      expect(validateDescription('x'.repeat(3000))).toBeNull();

      // Typical description
      expect(
        validateDescription('This is a detailed description of the hardware malfunction.')
      ).toBeNull();
    });
  });
});
