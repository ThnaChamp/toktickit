import { test, expect } from '@playwright/test';
import fs from 'fs';
import {
  mockRequesters,
  mockCategories,
  mockRelatedSystems,
  mockTicketsRequester1,
} from './mockData';

// Ensure all screenshot directories per ui-spec.md Section 12 exist
const screenshotDirs = [
  'artifacts/lab-02/screenshots/requester-selection',
  'artifacts/lab-02/screenshots/create-ticket',
  'artifacts/lab-02/screenshots/my-tickets',
  'artifacts/lab-02/screenshots/ticket-detail',
];

screenshotDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

test.describe('VIS-01 to VIS-05 & UI-Spec Section 12 Visual Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept reference data APIs
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

    // Default tickets route
    await page.route('**/api/tickets?**', async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search');

      let list = [...mockTicketsRequester1];
      if (search) {
        list = list.filter((t) =>
          t.summary.toLowerCase().includes(search.toLowerCase()) ||
          t.ticketNumber.toLowerCase().includes(search.toLowerCase())
        );
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            tickets: list,
            pagination: { page: 1, pageSize: 10, totalItems: list.length, totalPages: 1 },
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

  // ─── 1. Development Requester Selection Screen ────────────────────────────
  test('Screenshot: Development Requester Selection Screen', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/select-requester');

    await expect(page.locator('h1:has-text("Development Requester Selection")')).toBeVisible();
    await expect(page.locator('text=Authentication coming in Lab 3')).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/requester-selection/selection.png',
      fullPage: true,
    });
  });

  // ─── 2. Create Ticket Screens & States ────────────────────────────────────
  test('VIS-03 & Screenshots: Create Ticket Initial, Validation Error, Submitting, Success & API Failure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await page.locator('a:has-text("Create Ticket"):visible').first().click();

    await expect(page.locator('h1:has-text("Create Support Ticket")')).toBeVisible();

    // 2.1 Initial State
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/create-ticket/initial.png',
      fullPage: true,
    });

    // 2.2 Validation Error State
    await page.click('button:has-text("Submit Ticket")');
    await expect(page.locator('text=Summary must be between 5 and 200 characters.')).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/create-ticket/validation-error.png',
      fullPage: true,
    });

    // 2.2b Invalid Attachment Screenshot on Create Ticket screen (> 5 MB file)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label[for="create-attachment-input"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'large-error-log.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(6 * 1024 * 1024), // 6 MB exceeds 5 MB limit
    });

    await expect(page.locator('text=File size exceeds 5 MB limit.')).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/create-ticket/invalid-attachment.png',
      fullPage: true,
    });

    // Remove invalid file so form can proceed
    await page.click('button[title="Remove file"]');

    // Fill valid inputs for subsequent states
    await page.locator('select').nth(0).selectOption({ label: 'Hardware' });
    await page.locator('select').nth(1).selectOption({ label: 'Corporate Laptop' });
    await page.fill('input[placeholder*="Brief summary"]', 'Laptop battery drains very quickly');
    await page.fill(
      'textarea',
      'The display begins flickering erratically after unplugging AC adapter from the wall.'
    );

    // 2.3 Submitting State (Delayed response)
    let fulfillSubmit: (() => void) | null = null;
    const submitPromise = new Promise<void>((resolve) => {
      fulfillSubmit = resolve;
    });

    await page.route('**/api/tickets', async (route) => {
      if (route.request().method() === 'POST') {
        await submitPromise;
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 88,
              ticketNumber: 'TKT-2026-000088',
              requesterId: 1,
              summary: 'Laptop battery drains very quickly',
              description: 'The display begins flickering erratically after unplugging AC adapter.',
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

    await page.click('button:has-text("Submit Ticket")');
    await expect(page.locator('button:has-text("Submitting...")')).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/create-ticket/submitting.png',
      fullPage: true,
    });

    // Resolve submission and capture 2.4 Success State
    if (fulfillSubmit) fulfillSubmit();
    await expect(page.locator('text=Ticket Created Successfully!')).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/create-ticket/success.png',
      fullPage: true,
    });

    // 2.5 API Failure State
    await page.goto('/create-ticket');
    await page.locator('select').nth(0).selectOption({ label: 'Hardware' });
    await page.locator('select').nth(1).selectOption({ label: 'Corporate Laptop' });
    await page.fill('input[placeholder*="Brief summary"]', 'Simulated API failure test ticket');
    await page.fill('textarea', 'This description should be preserved after the server returns a 500 error.');

    await page.route('**/api/tickets', async (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed. Please retry.' },
          }),
        });
      }
    });

    await page.click('button:has-text("Submit Ticket")');
    await expect(page.locator('text=Database connection failed. Please retry.')).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/create-ticket/api-failure.png',
      fullPage: true,
    });
  });

  // ─── 3. My Tickets Screens & States ───────────────────────────────────────
  test('VIS-04 & Screenshots: My Tickets Desktop, Tablet, Empty State & No Results', async ({ page }) => {
    // 3.1 Desktop Table View
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await expect(page.locator('h1:has-text("My Support Tickets")')).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/my-tickets/desktop.png',
      fullPage: true,
    });

    // 3.2 Tablet View
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Laptop battery drains quickly').first()).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/my-tickets/tablet.png',
      fullPage: true,
    });

    // 3.3 No Results State (Search for non-existent keyword)
    await page.setViewportSize({ width: 1280, height: 800 });
    const searchInput = page.locator('input[placeholder*="Search by summary"]');
    await searchInput.fill('NonExistentTicketQuery999');
    await expect(page.locator('text=No tickets match your filters')).toBeVisible();
    await expect(page.locator('button:has-text("Clear Filters")').first()).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/my-tickets/no-results.png',
      fullPage: true,
    });

    // 3.4 Empty State (User with 0 tickets)
    await page.route('**/api/tickets?**', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            tickets: [],
            pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
          },
        }),
      });
    });

    await page.locator('button:has-text("Clear Filters")').first().click();
    await expect(page.locator('text=No tickets submitted yet')).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/my-tickets/empty.png',
      fullPage: true,
    });
  });

  // ─── 4. Mobile Viewports (VIS-01 & VIS-02) ─────────────────────────────────
  test('VIS-01 & Screenshots: My Tickets at Mobile (375px) with Clean Navbar & Drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');

    await expect(page.locator('h4:has-text("Laptop battery drains quickly")')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);

    const hamburgerBtn = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(hamburgerBtn).toBeVisible();

    // 4.1 Mobile Cards view
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/my-tickets/mobile.png',
      fullPage: true,
    });
  });

  test('VIS-02: Create Ticket form verification at mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await page.locator('a:has-text("Create Ticket"):visible').first().click();

    await page.click('button:has-text("Submit Ticket")');
    await expect(page.locator('text=Summary must be between 5 and 200 characters.')).toBeVisible();
  });

  // ─── 5. Ticket Detail, Attachments & Modals ────────────────────────────────
  test('VIS-05 & Screenshots: Ticket Detail Desktop, Attachments, Remove Dialog & Invalid Attachment', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await page.locator('text=TKT-2026-000001').first().click();

    await expect(page.locator('h1:has-text("TKT-2026-000001")')).toBeVisible();
    await expect(page.locator('text=IN PROGRESS')).toBeVisible();

    // 5.1 Ticket Detail Desktop
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/ticket-detail/desktop.png',
      fullPage: true,
    });

    // 5.2 Ticket Detail Attachments section
    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/ticket-detail/attachments.png',
      fullPage: true,
    });

    // 5.3 Invalid Attachment on Ticket Detail (> 5 MB file rejected)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label[for="attachment-input"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'large-system-dump.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(6 * 1024 * 1024), // 6 MB exceeds 5 MB limit
    });

    await expect(page.locator('text=File size exceeds 5 MB limit.')).toBeVisible();

    // 5.4 Remove Attachment Dialog Modal
    await page.click('button:has-text("Remove")');
    await expect(page.locator('h3:has-text("Remove Attachment")')).toBeVisible();

    await page.screenshot({
      path: 'artifacts/lab-02/screenshots/ticket-detail/remove-dialog.png',
    });
  });
});
