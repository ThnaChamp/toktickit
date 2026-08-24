import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RequesterSelectionPage from '../../src/pages/RequesterSelectionPage';
import { RequesterProvider } from '../../src/contexts/RequesterContext';
import * as api from '../../src/services/api';

describe('UI-15, UI-16, UI-17, UI-07: DevRequesterSelector Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  // ─── UI-15: Loading State ──────────────────────────────────────────────────
  it('UI-15: displays loading state while fetching requesters', () => {
    // Mock API to hang in pending state
    vi.spyOn(api, 'fetchRequesters').mockReturnValue(new Promise(() => {}));

    render(
      <BrowserRouter>
        <RequesterProvider>
          <RequesterSelectionPage />
        </RequesterProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading requesters…/i)).toBeInTheDocument();
  });

  // ─── UI-16: Error State with Retry Button ──────────────────────────────────
  it('UI-16: displays error message with Retry button when fetch fails', async () => {
    const fetchSpy = vi.spyOn(api, 'fetchRequesters').mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <RequesterProvider>
          <RequesterSelectionPage />
        </RequesterProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Unable to load requesters./i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Test clicking retry
    fetchSpy.mockResolvedValueOnce([
      { id: 1, name: 'Jennifer Anderson', email: 'jennifer@example.com' },
    ]);
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Jennifer Anderson')).toBeInTheDocument();
    });
  });

  // ─── UI-17: Empty State ────────────────────────────────────────────────────
  it('UI-17: displays empty state when no active requesters are available', async () => {
    vi.spyOn(api, 'fetchRequesters').mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <RequesterProvider>
          <RequesterSelectionPage />
        </RequesterProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No active requesters available/i)).toBeInTheDocument();
    });
  });

  // ─── Dropdown Population & Submit ──────────────────────────────────────────
  it('populates dropdown with requesters and enables submit button on selection', async () => {
    vi.spyOn(api, 'fetchRequesters').mockResolvedValueOnce([
      { id: 1, name: 'Jennifer Anderson', email: 'jennifer@example.com' },
      { id: 2, name: 'Michael Brown', email: 'michael@example.com' },
    ]);

    render(
      <BrowserRouter>
        <RequesterProvider>
          <RequesterSelectionPage />
        </RequesterProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jennifer Anderson')).toBeInTheDocument();
      expect(screen.getByText('Michael Brown')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Select Requester/i });
    expect(submitBtn).toBeDisabled();

    // Select Jennifer Anderson
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    expect(submitBtn).not.toBeDisabled();
  });
});

