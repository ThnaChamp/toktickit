import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows categories after clicking Check System', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'ok', service: 'TokTickIT API' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { id: 1, name: 'Account and Access' },
            { id: 2, name: 'Hardware' },
            { id: 3, name: 'Software' },
            { id: 4, name: 'Network' },
          ],
        } as Response)
    );

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /check system/i }));

    await waitFor(() => {
      expect(screen.getByText('Supported Request Categories')).toBeInTheDocument();
    });

    expect(screen.getByText('Account and Access')).toBeInTheDocument();
    expect(screen.getByText('Hardware')).toBeInTheDocument();
  });
});