import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // UI-01: TokTickIT heading renders
  it('renders the TokTickIT heading on page load', () => {
    render(<App />);
    expect(screen.getByText(/TokTickIT IT Service Desk/i)).toBeInTheDocument();
  });

  // UI-02: Loading state changes to category list
  it('shows categories after clicking Check System', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()

        //mock /api/health
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'ok', service: 'TokTickIT API' }),
        } as Response)
        
        //mock /api/categories
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

    // Click [Check System]
    fireEvent.click(screen.getByRole('button', { name: /check system/i }));

    await waitFor(() => {
      expect(screen.getByText('Supported Request Categories')).toBeInTheDocument();
    });

    expect(screen.getByText('Account and Access')).toBeInTheDocument();
    expect(screen.getByText('Hardware')).toBeInTheDocument();
  });

  // UI-03: API failure displays a useful error message
  it('shows an error message when the API call fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValueOnce(new Error('Network error'))
    );

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /check system/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Unable to connect to TokTickIT API/i)
      ).toBeInTheDocument();
    });
  });
});