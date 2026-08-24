import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('UI-07: App Route Guarding', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('UI-07: redirects to /select-requester when accessing app without a selected requester', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Development Requester Selection')).toBeInTheDocument();
      expect(screen.getByText(/Choose a development requester/i)).toBeInTheDocument();
    });
  });
});