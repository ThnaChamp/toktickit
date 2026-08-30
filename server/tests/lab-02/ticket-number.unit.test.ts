import { describe, it, expect, vi } from 'vitest';
import { generateTicketNumber } from '../../src/utils/ticketNumber.js';

describe('UNIT-01 & UNIT-02: Ticket Number Generator', () => {
  const currentYear = new Date().getFullYear();

  it('UNIT-01: should return format TKT-{YEAR}-{6-digit zero-padded}', async () => {
    // Mock prisma to return no existing tickets
    const mockPrisma = {
      ticket: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    const ticketNumber = await generateTicketNumber(mockPrisma);
    
    // Pattern: TKT-2026-000001
    const regex = new RegExp(`^TKT-${currentYear}-\\d{6}$`);
    expect(ticketNumber).toMatch(regex);
  });

  it('UNIT-02: should pad sequence to 6 digits starting from 000001 when no tickets exist', async () => {
    const mockPrisma = {
      ticket: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    const ticketNumber = await generateTicketNumber(mockPrisma);
    expect(ticketNumber).toBe(`TKT-${currentYear}-000001`);
  });

  it('UNIT-02: should increment sequence number from the last ticket', async () => {
    const mockPrisma = {
      ticket: {
        findFirst: vi.fn().mockResolvedValue({
          ticketNumber: `TKT-${currentYear}-000041`,
        }),
      },
    };

    const ticketNumber = await generateTicketNumber(mockPrisma);
    expect(ticketNumber).toBe(`TKT-${currentYear}-000042`);
  });

  it('UNIT-03: should reset sequence to 000001 when rolling over to a new year even if prior year had tickets', async () => {
    const mockPrisma = {
      ticket: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          // When querying for current year prefix, no tickets exist yet in the new year
          if (where?.ticketNumber?.startsWith === `TKT-${currentYear}-`) {
            return Promise.resolve(null);
          }
          // Prior year ticket with high sequence number
          return Promise.resolve({ ticketNumber: `TKT-${currentYear - 1}-009999` });
        }),
      },
    };

    const ticketNumber = await generateTicketNumber(mockPrisma);
    expect(ticketNumber).toBe(`TKT-${currentYear}-000001`);
  });
});

