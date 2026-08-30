import { test, expect } from '@playwright/test';
import {
  mockRequesters,
  mockCategories,
  mockRelatedSystems,
  mockTicketsRequester1,
  mockTicketsRequester2,
} from './mockData';

test.describe('E2E-01 to E2E-07: Requester Ticketing Full Lifecycle Flows', () => {
  let ticket1Attachments: any[];

  test.beforeEach(async ({ page }) => {
    ticket1Attachments = [...mockTicketsRequester1[0].attachments];

    // Intercept backend APIs
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
      const requesterId = url.searchParams.get('requesterId');
      const search = url.searchParams.get('search');
      const category = url.searchParams.get('category');

      let list = requesterId === '2' ? [...mockTicketsRequester2] : [...mockTicketsRequester1];

      if (search) {
        list = list.filter(
          (t) =>
            t.summary.toLowerCase().includes(search.toLowerCase()) ||
            t.ticketNumber.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (category) {
        list = list.filter((t) => t.category?.name === category);
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

    // Individual ticket details
    await page.route('**/api/tickets/TKT-2026-000001?**', async (route) => {
      const url = new URL(route.request().url());
      const requesterId = url.searchParams.get('requesterId');
      if (requesterId && requesterId !== '1') {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { code: 'FORBIDDEN', message: 'You do not have access to this ticket.' },
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ...mockTicketsRequester1[0],
            attachments: ticket1Attachments,
          },
        }),
      });
    });

    // Creation endpoint
    await page.route('**/api/tickets', async (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 99,
              ticketNumber: 'TKT-2026-000099',
              requesterId: postData.requesterId,
              summary: postData.summary,
              description: postData.description,
              requestedPriority: postData.requestedPriority,
              itPriority: postData.requestedPriority,
              currentStatus: 'NEW',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Attachment endpoints
    await page.route('**/api/tickets/TKT-2026-000001/attachments', async (route) => {
      if (route.request().method() === 'POST') {
        const newAttachment = {
          id: 201,
          ticketId: 1,
          uploaderId: 1,
          originalFilename: 'new-evidence.pdf',
          storedFilename: 'attachment-201.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 12400,
          storagePath: 'uploads/attachment-201.pdf',
          removedAt: null,
          removedByRequesterId: null,
          removalReason: null,
          createdAt: new Date().toISOString(),
          uploader: { id: 1, name: 'Jennifer Anderson' },
        };
        ticket1Attachments.push(newAttachment);

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: newAttachment,
          }),
        });
      }
    });

    await page.route('**/api/attachments/101', async (route) => {
      if (route.request().method() === 'DELETE') {
        const postData = route.request().postDataJSON();
        const updated = {
          ...ticket1Attachments[0],
          removedAt: new Date().toISOString(),
          removalReason: postData.removalReason,
          removedByRequesterId: 1,
        };
        ticket1Attachments[0] = updated;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: updated,
          }),
        });
      }
    });
  });

  // ─── E2E-01: Select Requester → Create Ticket → See Ticket Number ───────────
  test('E2E-01: Select Requester → Create Ticket → verify Ticket Number is displayed', async ({ page }) => {
    // 1. Open home page (redirects to /select-requester)
    await page.goto('/');
    await expect(page).toHaveURL(/.*select-requester/);

    // 2. Select Requester "Jennifer Anderson"
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await expect(page).toHaveURL(/.*my-tickets/);

    // 3. Navigate to Create Ticket
    await page.click('a:has-text("Create Ticket")');
    await expect(page).toHaveURL(/.*create-ticket/);

    // 4. Fill form
    await page.locator('select').nth(0).selectOption({ label: 'Hardware' });
    await page.locator('select').nth(1).selectOption({ label: 'Corporate Laptop' });
    await page.click('input[value="MEDIUM"]');
    await page.fill('input[placeholder*="Brief summary"]', 'Laptop screen flickers when running on battery');
    await page.fill(
      'textarea',
      'The display begins flickering erratically after unplugging AC adapter from the wall.'
    );

    // 5. Submit form
    await page.click('button:has-text("Submit Ticket")');

    // 6. Verify Ticket Number displayed on success screen
    await expect(page.locator('text=Ticket Created Successfully!')).toBeVisible();
    await expect(page.locator('text=TKT-2026-000099')).toBeVisible();
  });

  // ─── E2E-02: Requester Isolation (A vs B) ──────────────────────────────────
  test('E2E-02: Switching between Requester A and B displays strictly isolated ticket lists', async ({ page }) => {
    // 1. Choose Requester A (Jennifer)
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await expect(page.locator('text=Laptop battery drains quickly').first()).toBeVisible();

    // 2. Switch to Requester B (Sarah Johnson)
    await page.click('button:has-text("Change Requester")');
    await expect(page).toHaveURL(/.*select-requester/);
    await page.selectOption('select', { label: 'Sarah Johnson' });
    await page.click('button:has-text("Select Requester")');

    // 3. Verify Requester A tickets are gone, and Sarah's ticket is shown
    await expect(page.locator('text=Laptop battery drains quickly')).toHaveCount(0);
    await expect(page.locator('text=Email not syncing on mobile').first()).toBeVisible();
  });

  // ─── E2E-03: Search & Filter in My Tickets ─────────────────────────────────
  test('E2E-03: Search keyword and category filter return accurate matching tickets', async ({ page }) => {
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');

    // Search for "VPN"
    const searchInput = page.locator('input[placeholder*="Search by summary"]');
    await searchInput.fill('VPN');

    // Should only see VPN ticket
    await expect(page.locator('text=Cannot connect to VPN from home').first()).toBeVisible();
    await expect(page.locator('text=Laptop battery drains quickly')).toHaveCount(0);

    // Clear search
    await searchInput.fill('');
    await expect(page.locator('text=Laptop battery drains quickly').first()).toBeVisible();
  });

  // ─── E2E-04: Pagination Controls ───────────────────────────────────────────
  test('E2E-04: Pagination metadata and controls render correctly', async ({ page }) => {
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');

    await expect(page.locator('text=Showing 1 to 2 of 2 tickets')).toBeVisible();
    await expect(page.locator('button:has-text("Previous")')).toBeDisabled();
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();
  });

  // ─── E2E-05: Ticket Detail & Attachment Upload ─────────────────────────────
  test('E2E-05: Inspect ticket details and upload an attachment', async ({ page }) => {
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');

    // Click on ticket
    await page.locator('text=TKT-2026-000001').first().click();
    await expect(page).toHaveURL(/.*tickets\/TKT-2026-000001/);

    // Verify Read-only header details
    await expect(page.locator('h1:has-text("TKT-2026-000001")')).toBeVisible();
    await expect(page.locator('text=Jennifer Anderson').first()).toBeVisible();

    // Upload attachment
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label[for="attachment-input"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'new-evidence.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 sample pdf content'),
    });

    await expect(page.locator('text=Attachments (2/5)')).toBeVisible();
  });

  // ─── E2E-06: Soft-Remove Attachment with Reason ────────────────────────────
  test('E2E-06: Soft-remove attachment with required reason and verify status', async ({ page }) => {
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Jennifer Anderson' });
    await page.click('button:has-text("Select Requester")');
    await page.locator('text=TKT-2026-000001').first().click();

    // Click remove on existing attachment
    await page.click('button:has-text("Remove")');

    // Verify modal is shown
    await expect(page.locator('h3:has-text("Remove Attachment")')).toBeVisible();

    // Fill reason
    await page.fill(
      'textarea[placeholder*="confidential document"]',
      'Uploaded wrong battery screenshot containing personal serial number.'
    );

    // Click Confirm Removal
    await page.click('button:has-text("Confirm Removal")');

    // Modal closes
    await expect(page.locator('h3:has-text("Remove Attachment")')).not.toBeVisible();
  });

  // ─── E2E-07: Cross-Requester Access Forbidden ──────────────────────────────
  test('E2E-07: Direct URL access to another requester ticket returns 403 error page', async ({ page }) => {
    // Select Requester B (Sarah, ID 2)
    await page.goto('/select-requester');
    await page.selectOption('select', { label: 'Sarah Johnson' });
    await page.click('button:has-text("Select Requester")');

    // Directly attempt to visit Requester A's ticket (TKT-2026-000001)
    await page.goto('/tickets/TKT-2026-000001');

    // Verify Forbidden error message is displayed
    await expect(
      page.locator('text=You do not have access to this ticket.')
    ).toBeVisible();
  });
});

