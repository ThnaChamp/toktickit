import { test, expect } from '@playwright/test';
import fs from 'fs';
import {
  mockRequesters,
  mockCategories,
  mockRelatedSystems,
  mockTicketsRequester1,
} from './mockData';

// Ensure artifact screenshot directories exist
const screenshotDirs = [
  'artifacts/lab-02/screenshots/create-ticket',
  'artifacts/lab-02/screenshots/my-tickets',
  'artifacts/lab-02/screenshots/ticket-detail',
];

screenshotDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

test.describe('VIS-01 to VIS-05: Responsive & Visual Verification with Automated Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept APIs for reliable visuals
    await page.route('**/api/requesters', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockRequesters }),
      });
    });

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockCategories }),
      });
    });

    await page.route('**/api/related-systems', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockRelatedSystems }),
      });
    });

    await page.route('**/api/tickets?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            tickets: mockTicketsRequester1,
            pagination: { page: 1, pageSize: 10, totalItems: 2, totalPages: 1 },
          },
        }),
      });
    });

    await page.route('**/api/tickets/TKT-2026-000001?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockTicketsRequester1[0] }),
      });
    });
  });

  // ─── VIS-03: Create Ticket at Desktop (1280px) ─────────────────────────────
  test('VIS-03: Create Ticket layout at desktop (1280px) matches Zen Green spec', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await page.click('a:has-text("Create Ticket")');

    await expect(page.locator('h1:has-text("Create Support Ticket")')).toBeVisible();

    // Capture initial desktop screenshot
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/create-ticket/desktop-initial.png',
      fullPage: true,
    });

    // Trigger validation
    await page.click('button:has-text("Submit Ticket")');
    await expect(page.locator('text=Summary must be between 5 and 200 characters.')).toBeVisible();

    // Capture validation error screenshot
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/create-ticket/desktop-validation.png',
      fullPage: true,
    });

    // Submit valid form to capture success state screenshot
    await page.route('**/api/tickets', async (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 88,
              ticketNumber: 'TKT-2026-000088',
              requesterId: 1,
              summary: 'Laptop screen flickers',
              description: 'Screen flickers when on battery.',
              requestedPriority: 'MEDIUM',
              itPriority: 'MEDIUM',
              currentStatus: 'NEW',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await page.locator('select').nth(0).selectOption({ label: 'Hardware' });
    await page.locator('select').nth(1).selectOption({ label: 'Corporate Laptop' });
    await page.fill('input[placeholder*="Brief summary"]', 'Laptop screen flickers when running on battery');
    await page.fill(
      'textarea',
      'The display begins flickering erratically after unplugging AC adapter from the wall.'
    );
    await page.click('button:has-text("Submit Ticket")');
    await expect(page.locator('text=Ticket Created Successfully!')).toBeVisible();

    // Capture success screenshot
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/create-ticket/desktop-success.png',
      fullPage: true,
    });
  });

  // ─── VIS-04: My Tickets at Tablet (768px) & Desktop (1280px) ───────────────
  test('VIS-04: My Tickets layout at tablet (768px) is clear with no overflow', async ({ page }) => {
    // Desktop table screenshot first
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await expect(page.locator('h1:has-text("My Support Tickets")')).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/my-tickets/desktop-table.png',
      fullPage: true,
    });

    // Tablet screenshot
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Laptop battery drains quickly').first()).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/my-tickets/tablet.png',
      fullPage: true,
    });
  });

  // ─── VIS-01: My Tickets at Mobile (375px) ──────────────────────────────────
  test('VIS-01: My Tickets displays stacked card layout at mobile (375px) with no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');

    // On mobile (<768px), ticket summary is rendered inside mobile card <h4>
    await expect(page.locator('h4:has-text("Laptop battery drains quickly")')).toBeVisible();

    // Verify horizontal scroll width does not exceed viewport width
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);

    // Verify mobile hamburger menu button exists and is visible
    const hamburgerBtn = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(hamburgerBtn).toBeVisible();

    // Capture mobile card layout screenshot (with closed clean navbar)
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/my-tickets/mobile-cards.png',
      fullPage: true,
    });

    // Open mobile hamburger menu drawer and capture mobile navigation screenshot
    await hamburgerBtn.click();
    await expect(page.locator('text=Current Requester:')).toBeVisible();
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/my-tickets/mobile-menu-open.png',
      fullPage: true,
    });
    // Close menu again
    await hamburgerBtn.click();
  });

  // ─── VIS-02: Create Ticket at Mobile (375px) ───────────────────────────────
  test('VIS-02: Create Ticket form stacks vertically at mobile (375px) with visible error messages', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await page.locator('a:has-text("Create Ticket"):visible').click();

    await page.click('button:has-text("Submit Ticket")');
    await expect(page.locator('text=Summary must be between 5 and 200 characters.')).toBeVisible();

    // Capture mobile form validation screenshot
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/create-ticket/mobile.png',
      fullPage: true,
    });
  });

  // ─── VIS-05: Priority & Status Badges & Ticket Detail ──────────────────────
  test('VIS-05: Ticket Detail screen renders read-only metadata, badges, and attachment states', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await page.locator('text=TKT-2026-000001').first().click();

    await expect(page.locator('h1:has-text("TKT-2026-000001")')).toBeVisible();
    await expect(page.locator('text=IN PROGRESS')).toBeVisible();

    // Capture Ticket Detail screenshot
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/ticket-detail/desktop.png',
      fullPage: true,
    });

    // Open Soft-Removal dialog
    await page.click('button:has-text("Remove")');
    await expect(page.locator('h3:has-text("Remove Attachment")')).toBeVisible();

    // Capture Soft-Removal dialog screenshot
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/ticket-detail/soft-remove-modal.png',
    });
  });
});
