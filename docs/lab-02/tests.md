# Lab 2 Test Plan and Results

> **Status:** Draft — Must be created before or alongside implementation. Must not be reconstructed after the fact.  
> **Last Updated:** 2026-08-22

---

## 1. Test Strategy

### 1.1 Levels

| Level | Tool / Framework | Location | Purpose |
|-------|-----------------|----------|---------|
| **Unit** | Vitest / Jest | `server/tests/lab-02/` | Pure logic: Ticket Number generation, validation functions, sanitization helpers |
| **API / Integration** | Supertest + Vitest | `server/tests/lab-02/` | HTTP request/response contracts, ownership enforcement, DB interactions with a test database |
| **UI Component** | React Testing Library + Vitest | `client/src/.../lab-02 tests/` | Component rendering, user interaction, field validation, state transitions |
| **UI Style** | React Testing Library | `client/src/.../lab-02 tests/` | Presence of CSS classes, ARIA attributes, badge text, asterisks |
| **Responsive** | Playwright | `e2e/lab-02/` | Screenshots at desktop (1280px), tablet (768px), mobile (375px) viewports |
| **E2E** | Playwright | `e2e/lab-02/` | Complete user flows across frontend and backend |

### 1.2 TDD Approach

1. Write failing tests based on the Acceptance Criteria.  
2. Implement the minimum code to make tests pass.  
3. Refactor while keeping tests green.  
4. No test may be skipped, disabled, or commented out in the final `main` branch.

### 1.3 Test Database

- API tests use a separate test database (configured via `DATABASE_URL` in `.env.test`).
- The test database is migrated and seeded before each test run.
- Tests are isolated: each test cleans up its own created data (or uses transactions).

---

## 2. Planned Tests

### 2.1 Unit Tests

| Test ID | Type | Req / AC | What It Tests | Expected Result | Test File | Final |
|---------|------|----------|---------------|-----------------|-----------|-------|
| UNIT-01 | Unit | BR-01 | Ticket Number generator returns `TKT-{YEAR}-{6-digit zero-padded}` format | Correct format string | `server/tests/lab-02/ticket-number.unit.test.ts` | PASS |
| UNIT-02 | Unit | BR-01 | Ticket Number generator pads sequence to 6 digits | `TKT-2026-000001` for seq=1 | `server/tests/lab-02/ticket-number.unit.test.ts` | PASS |
| UNIT-03 | Unit | BR-07 | Summary trimming removes leading/trailing whitespace | `"  hello  "` → `"hello"` | `server/tests/lab-02/validation.unit.test.ts` | |
| UNIT-04 | Unit | BR-07 | Summary validation rejects < 5 chars after trim | Throws/returns validation error | `server/tests/lab-02/validation.unit.test.ts` | |
| UNIT-05 | Unit | BR-07 | Summary validation rejects > 200 chars | Throws/returns validation error | `server/tests/lab-02/validation.unit.test.ts` | |
| UNIT-06 | Unit | BR-08 | Description validation rejects < 10 chars after trim | Throws/returns validation error | `server/tests/lab-02/validation.unit.test.ts` | |
| UNIT-07 | Unit | BR-08 | Description validation rejects > 3000 chars | Throws/returns validation error | `server/tests/lab-02/validation.unit.test.ts` | |
| UNIT-08 | Unit | BR-22 | Filename sanitizer produces UUID-prefixed safe filename | Output matches `^[a-f0-9-]{36}-.+$` | `server/tests/lab-02/attachment.unit.test.ts` | |
| UNIT-09 | Unit | BR-22 | Filename sanitizer preserves original filename in metadata | `originalFilename` unchanged | `server/tests/lab-02/attachment.unit.test.ts` | PASS |

### 2.2 API / Integration Tests

| Test ID | Type | Req / AC | What It Tests | Expected Result | Test File | Final |
|---------|------|----------|---------------|-----------------|-----------|-------|
| API-01 | API | AC-01 | POST `/api/tickets` with valid data | 201; one Ticket saved; `ticketNumber` returned; `requesterId` matches | `server/tests/lab-02/create-ticket.api.test.ts` | PASS |
| API-02 | API | AC-05, BR-07 | POST `/api/tickets` with empty summary | 400; `details[].field === "summary"` | `server/tests/lab-02/create-ticket.api.test.ts` | PASS |
| API-03 | API | AC-05, BR-07 | POST `/api/tickets` with summary < 5 chars | 400; field-level error for `summary` | `server/tests/lab-02/create-ticket.api.test.ts` | PASS |
| API-04 | API | BR-08 | POST `/api/tickets` with description < 10 chars | 400; field-level error for `description` | `server/tests/lab-02/create-ticket.api.test.ts` | PASS |
| API-05 | API | BR-09 | POST `/api/tickets` with invalid `categoryId` | 400; `INVALID_CATEGORY` error | `server/tests/lab-02/create-ticket.api.test.ts` | PASS |
| API-06 | API | BR-11 | POST `/api/tickets` with invalid `requestedPriority` | 400; validation error | `server/tests/lab-02/create-ticket.api.test.ts` | PASS |
| API-07 | API | BR-02 | POST `/api/tickets` — new ticket has `currentStatus = NEW` | Response contains `"currentStatus": "NEW"` | `server/tests/lab-02/create-ticket.api.test.ts` | PASS |
| API-08 | API | BR-12 | POST `/api/tickets` — `itPriority` equals `requestedPriority` | `itPriority === requestedPriority` in response | `server/tests/lab-02/create-ticket.api.test.ts` | PASS |
| API-09 | API | AC-09, BR-06 | GET `/api/tickets` — only returns tickets belonging to `requesterId` | Other requesters' tickets absent | `server/tests/lab-02/my-tickets.api.test.ts` | PASS |
| API-10 | API | AC-10, BR-26 | GET `/api/tickets?search=laptop` | Only matching tickets returned; case-insensitive | `server/tests/lab-02/my-tickets.api.test.ts` | PASS |
| API-11 | API | AC-11 | GET `/api/tickets?category=Hardware` | Only Hardware tickets returned | `server/tests/lab-02/my-tickets.api.test.ts` | PASS |
| API-12 | API | AC-12, BR-23 | GET `/api/tickets` default sort | Ordered by `createdAt DESC` | `server/tests/lab-02/my-tickets.api.test.ts` | PASS |
| API-13 | API | AC-13, BR-24 | GET `/api/tickets?page=2&pageSize=10` | Correct page of 10 tickets; accurate pagination metadata | `server/tests/lab-02/my-tickets.api.test.ts` | PASS |
| API-14 | API | BR-25 | GET `/api/tickets?pageSize=99` | 400; `INVALID_PAGE_SIZE` | `server/tests/lab-02/my-tickets.api.test.ts` | PASS |
| API-15 | API | AC-03, BR-06 | GET `/api/tickets/:ticketNumber` with wrong `requesterId` | 403 `FORBIDDEN` | `server/tests/lab-02/ticket-detail.api.test.ts` | PASS |
| API-16 | API | AC-16 | GET `/api/tickets/:ticketNumber` with correct `requesterId` | 200; full ticket including attachments | `server/tests/lab-02/ticket-detail.api.test.ts` | PASS |
| API-17 | API | — | GET `/api/tickets/TKT-0000-NOTEXIST` | 404 `NOT_FOUND` | `server/tests/lab-02/ticket-detail.api.test.ts` | PASS |
| API-18 | API | AC-17, BR-18 | POST attachment when 4 active attachments exist | 201; total active = 5 | `server/tests/lab-02/attachments.api.test.ts` | PASS |
| API-19 | API | AC-18, BR-18 | POST attachment when 5 active attachments exist | 409 `ATTACHMENT_LIMIT` | `server/tests/lab-02/attachments.api.test.ts` | PASS |
| API-20 | API | BR-17 | POST attachment > 5 MB | 413 `FILE_TOO_LARGE` | `server/tests/lab-02/attachments.api.test.ts` | PASS |
| API-21 | API | BR-16 | POST attachment with unsupported type (e.g. `.exe`) | 415 `UNSUPPORTED_TYPE` | `server/tests/lab-02/attachments.api.test.ts` | PASS |
| API-22 | API | AC-19 | GET `/api/attachments/:id/download` for active attachment | 200; file bytes returned | `server/tests/lab-02/attachments.api.test.ts` | PASS |
| API-23 | API | AC-21, BR-20 | GET download for removed attachment | 403 `REMOVED` | `server/tests/lab-02/attachments.api.test.ts` | PASS |
| API-24 | API | AC-20, BR-19 | DELETE `/api/attachments/:id` with valid reason | 200; `removedAt` set; `removalReason` stored | `server/tests/lab-02/attachments.api.test.ts` | PASS |
| API-25 | API | BR-19 | DELETE attachment without `removalReason` | 400 `VALIDATION_ERROR` | `server/tests/lab-02/attachments.api.test.ts` | PASS |
| API-26 | API | — | DELETE already-removed attachment | 409 `ALREADY_REMOVED` | `server/tests/lab-02/attachments.api.test.ts` | PASS |
| API-27 | API | BR-04 | GET `/api/requesters` — inactive Requester is absent | Inactive Requester not in response | `server/tests/lab-02/requesters.api.test.ts` | PASS |

### 2.3 UI Component Tests

| Test ID | Type | Req / AC | What It Tests | Expected Result | Test File | Final |
|---------|------|----------|---------------|-----------------|-----------|-------|
| UI-01 | UI | AC-05 | CreateTicket: submit with empty Summary | Field error below Summary; API not called | `client/tests/lab-02/CreateTicket.test.tsx` | PASS |
| UI-02 | UI | AC-06 | CreateTicket: select file > 5 MB | Per-file error shown; file not in valid list | `client/tests/lab-02/AttachmentSection.test.tsx` | PASS |
| UI-03 | UI | AC-07 | CreateTicket: select unsupported file type | Per-file error shown; file not in valid list | `client/tests/lab-02/AttachmentSection.test.tsx` | PASS |
| UI-04 | UI | BR-14 | CreateTicket: Submit button shows busy state during submission | Button text changes; button disabled | `client/tests/lab-02/CreateTicket.test.tsx` | PASS |
| UI-05 | UI | AC-08 | CreateTicket: API failure preserves form values | All field values intact after error | `client/tests/lab-02/CreateTicket.test.tsx` | PASS |
| UI-06 | UI | AC-01 | CreateTicket: success state shows Ticket Number | Ticket Number displayed prominently | `client/tests/lab-02/CreateTicket.test.tsx` | PASS |
| UI-07 | UI | FR-14 | Route Guard: no Requester selected redirects to Selection screen | Redirect to `/select-requester` | `client/src/App.test.tsx` | PASS |
| UI-08 | UI | AC-14 | MyTickets: empty state when no tickets exist | Empty-state component rendered (not error) | `client/tests/lab-02/MyTickets.test.tsx` | PASS |
| UI-09 | UI | AC-15 | MyTickets: no-results state after search | No-results component rendered | `client/tests/lab-02/MyTickets.test.tsx` | PASS |
| UI-10 | UI | — | MyTickets: Clear Filters appears only when filter active | Not visible initially; visible after filter set | `client/tests/lab-02/MyTickets.test.tsx` | PASS |
| UI-11 | UI | AC-16 | TicketDetail: all header fields render as read-only | No editable inputs in header | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | PASS |
| UI-12 | UI | BR-20 | AttachmentSection: removed attachment has no Download button | Download button absent for removed items | `client/tests/lab-02/AttachmentSection.test.tsx` | PASS |
| UI-13 | UI | BR-18 | AttachmentSection: Add Attachment disabled at limit | Button disabled; tooltip visible | `client/tests/lab-02/AttachmentSection.test.tsx` | PASS |
| UI-14 | UI | — | RequiredField: red asterisk present on all required fields | `*` visible for Summary, Description, Category, etc. | `client/tests/lab-02/CreateTicket.test.tsx` | PASS |
| UI-15 | UI | AC-02 | Dev Requester Selector: loading state shown during fetch | Spinner/skeleton visible | `client/tests/lab-02/DevRequesterSelector.test.tsx` | PASS |
| UI-16 | UI | AC-24 | Dev Requester Selector: error state with Retry button | Error message + Retry button rendered | `client/tests/lab-02/DevRequesterSelector.test.tsx` | PASS |
| UI-17 | UI | AC-25 | Dev Requester Selector: empty state when no active requesters | Empty state rendered (not error) | `client/tests/lab-02/DevRequesterSelector.test.tsx` | PASS |

### 2.4 E2E Tests

| Test ID | Type | Req / AC | What It Tests | Expected Result | Test File | Final |
|---------|------|----------|---------------|-----------------|-----------|-------|
| E2E-01 | E2E | AC-01, AC-02 | Select Requester → Create Ticket → see Ticket Number | Ticket Number displayed; stored in DB | `e2e/lab-02/requester-ticket-flow.spec.ts` | |
| E2E-02 | E2E | AC-09 | Select Requester A → view tickets → switch to B → tickets change | Requester A's tickets absent for B | `e2e/lab-02/requester-ticket-flow.spec.ts` | |
| E2E-03 | E2E | AC-10, AC-11 | Search and filter in My Tickets | Correct filtered results shown | `e2e/lab-02/requester-ticket-flow.spec.ts` | |
| E2E-04 | E2E | AC-13 | Paginate through My Tickets | Correct pages; accurate count | `e2e/lab-02/requester-ticket-flow.spec.ts` | |
| E2E-05 | E2E | AC-16, AC-17 | Open Ticket Detail → upload attachment | Attachment appears in list | `e2e/lab-02/requester-ticket-flow.spec.ts` | |
| E2E-06 | E2E | AC-20, AC-21 | Soft-remove attachment → download rejected | Removed badge shown; download fails with 403 | `e2e/lab-02/requester-ticket-flow.spec.ts` | |
| E2E-07 | E2E | AC-03 | Direct URL access to other Requester's ticket | 403 page or redirect | `e2e/lab-02/requester-ticket-flow.spec.ts` | |

### 2.5 Responsive and Visual Tests

| Test ID | Type | Req / AC | What It Tests | Expected Result | Test File | Final |
|---------|------|----------|---------------|-----------------|-----------|-------|
| VIS-01 | Responsive | AC-22 | My Tickets at mobile (375px) | Card layout; no horizontal scroll | `e2e/lab-02/responsive.spec.ts` | |
| VIS-02 | Responsive | AC-23 | Create Ticket validation at mobile | Error messages visible; no clipping | `e2e/lab-02/responsive.spec.ts` | |
| VIS-03 | Responsive | — | Create Ticket at desktop (1280px) | Multi-column layout screenshot matches ui-spec | `e2e/lab-02/responsive.spec.ts` | |
| VIS-04 | Responsive | — | My Tickets at tablet (768px) | Usable layout; no overflow | `e2e/lab-02/responsive.spec.ts` | |
| VIS-05 | Visual | — | Priority and status badges — all variants | All badge texts and colors match spec | `e2e/lab-02/responsive.spec.ts` | |

---

## 3. Acceptance-Criterion Traceability

| AC ID | Criterion Summary | Covered By Test(s) |
|-------|------------------|--------------------|
| AC-01 | Valid submission → Ticket Number displayed | API-01, UI-06, E2E-01 |
| AC-02 | No Requester → redirect to Selection screen | UI-07, E2E-01 |
| AC-03 | Cross-requester API access → 403 | API-15, E2E-07 |
| AC-04 | Category dropdown populated from DB | API test (GET /api/categories), UI-01 (implicit) |
| AC-05 | Empty/short Summary → field-level error | API-02, API-03, UI-01 |
| AC-06 | File > 5 MB → per-file error | API-20, UI-02 |
| AC-07 | Unsupported file type → per-file error | API-21, UI-03 |
| AC-08 | Backend failure → safe error; values preserved | UI-05, E2E-01 (simulated) |
| AC-09 | Requester switch → different ticket list | API-09, E2E-02 |
| AC-10 | Search by keyword | API-10, E2E-03 |
| AC-11 | Category filter | API-11, E2E-03 |
| AC-12 | Column sort toggle | API-12 |
| AC-13 | Pagination page 2 | API-13, E2E-04 |
| AC-14 | Empty state (no tickets) | UI-08 |
| AC-15 | No-results state (search/filter) | UI-09 |
| AC-16 | Ticket Detail read-only | UI-11, E2E-05 |
| AC-17 | Upload 5th attachment succeeds | API-18, E2E-05 |
| AC-18 | Upload fails at limit 5 | API-19 |
| AC-19 | Download active attachment | API-22, E2E-05 |
| AC-20 | Soft-remove with reason | API-24, E2E-06 |
| AC-21 | Download removed attachment → 403 | API-23, E2E-06 |
| AC-22 | Mobile My Tickets → card layout | VIS-01 |
| AC-23 | Validation errors visible at all viewports | VIS-02 |
| AC-24 | Selection screen load error → retry | UI-16 |
| AC-25 | No active requesters → empty state | UI-17 |

---

## 4. Responsive and Visual Checklist

To be completed after implementation with actual screenshots.

### 4.1 Colors and Branding
- [ ] App header background is `#006B3C`.
- [ ] Primary buttons are `#006B3C`.
- [ ] Active nav link uses `#0B7A46` accent.
- [ ] Read-only fields use `#F0F4F1` background; visually distinct from editable fields.
- [ ] Error text is dark red (`#B91C1C`); error border is `#DC2626`.
- [ ] Body text is dark charcoal-green (not pure black).

### 4.2 Form and Validation
- [ ] All required fields show a red asterisk.
- [ ] Validation messages appear below the associated field.
- [ ] Submit button shows spinner and is disabled during submission.
- [ ] Form values preserved after API failure.

### 4.3 My Tickets
- [ ] Desktop: full table with all columns.
- [ ] Mobile: card layout; no horizontal scrolling.
- [ ] Sort indicators visible on sortable columns.
- [ ] Clear Filters appears only when a filter is active.
- [ ] Empty state and no-results state are visually distinct.
- [ ] Pagination text "Showing X to Y of Z tickets" is accurate.

### 4.4 Ticket Detail and Attachments
- [ ] All header fields are read-only (gray-green background).
- [ ] Priority and status badges are text-labeled (not color-only).
- [ ] Removed attachments show "REMOVED" badge; no Download button.
- [ ] Add Attachment disabled at limit with tooltip.
- [ ] Remove dialog requires non-empty reason before enabling Remove button.

---

## 5. Test Commands

```bash
# Unit and API tests (server)
cd server
npx vitest run tests/lab-02/

# UI component tests (client)
cd client
npx vitest run src/tests/lab-02/

# E2E and responsive tests
npx playwright test e2e/lab-02/

# All tests (from repo root)
npm run test:lab-02
```

> These commands must produce passing output from the `main` branch. Exact commands will be updated once the project structure is confirmed.

---

## 6. Final Results

| Test ID | Final Status | Notes |
|---------|-------------|-------|
| UNIT-01 | PASS | Ticket number format `TKT-YYYY-XXXXXX` verified |
| UNIT-02 | PASS | 6-digit zero-padding and sequence increment verified |
| API-01 | PASS | Valid ticket creation returns 201 Created and ticketNumber |
| API-02 | PASS | Empty summary returns 400 with VALIDATION_ERROR |
| API-03 | PASS | Short summary (< 5 chars) returns 400 Bad Request |
| API-04 | PASS | Short description (< 10 chars) returns 400 Bad Request |
| API-05 | PASS | Non-existent categoryId returns 400 Bad Request |
| API-06 | PASS | Invalid priority enum returns 400 Bad Request |
| API-07 | PASS | Initial currentStatus correctly defaults to `NEW` |
| API-08 | PASS | itPriority correctly defaults to requestedPriority |
| API-27 | PASS | GET /api/requesters returns only active requesters (Alex Turner excluded) |
| UI-01 | PASS | CreateTicket empty summary shows error and blocks API submission |
| UI-04 | PASS | CreateTicket submit button shows busy state and is disabled |
| UI-05 | PASS | CreateTicket preserves form input values on API error |
| UI-06 | PASS | CreateTicket displays success screen with official Ticket Number |
| UI-07 | PASS | Route guard redirects to /select-requester when session is empty |
| UI-14 | PASS | Required asterisks (*) present on all mandatory form fields |
| UI-15 | PASS | Dev requester selector shows loading indicator during fetch |
| UI-16 | PASS | Dev requester selector shows error banner with working Retry button |
| UI-17 | PASS | Dev requester selector shows empty state when no active requesters |
| API-09 | PASS | GET /api/tickets strictly enforces requester ownership (Requester B tickets absent) |
| API-10 | PASS | GET /api/tickets filters correctly by search query (case-insensitive) |
| API-11 | PASS | GET /api/tickets filters correctly by category name |
| API-12 | PASS | GET /api/tickets sorts by createdAt DESC by default |
| API-13 | PASS | GET /api/tickets returns valid pagination structure and metadata |
| API-14 | PASS | GET /api/tickets returns 400 INVALID_PAGE_SIZE for invalid pageSize |
| UI-08 | PASS | MyTickets displays friendly empty state when user has 0 tickets |
| UI-09 | PASS | MyTickets displays no-results state when search/filters match 0 tickets |
| UI-10 | PASS | MyTickets Clear Filters button appears only when filters are active |
| UNIT-09 | PASS | Filename sanitizer preserves original filename and cleans unsafe characters |
| API-15 | PASS | GET /api/tickets/:ticketNumber returns 403 when accessed by non-owner |
| API-16 | PASS | GET /api/tickets/:ticketNumber returns 200 with full details and relations |
| API-17 | PASS | GET /api/tickets/:ticketNumber returns 404 for non-existent ticket |
| API-18 | PASS | POST attachment succeeds with valid file (JPG/PNG/WEBP/PDF <= 5 MB) |
| API-19 | PASS | POST attachment returns 409 ATTACHMENT_LIMIT at 5 active attachments |
| API-20 | PASS | POST attachment returns 413 FILE_TOO_LARGE for file > 5 MB |
| API-21 | PASS | POST attachment returns 415 UNSUPPORTED_TYPE for disallowed MIME type |
| API-22 | PASS | GET /api/attachments/:id/download allows downloading active attachment |
| API-23 | PASS | GET /api/attachments/:id/download returns 403 REMOVED for soft-deleted file |
| API-24 | PASS | DELETE /api/attachments/:id sets removedAt and stores removalReason |
| API-25 | PASS | DELETE /api/attachments/:id returns 400 VALIDATION_ERROR when reason omitted |
| API-26 | PASS | DELETE /api/attachments/:id returns 409 ALREADY_REMOVED on double delete |
| UI-02 | PASS | AttachmentSection shows error when selecting file larger than 5 MB |
| UI-03 | PASS | AttachmentSection shows error when selecting unsupported file type |
| UI-11 | PASS | TicketDetail renders all header metadata fields as read-only |
| UI-12 | PASS | AttachmentSection hides Download button for soft-removed attachment |
| UI-13 | PASS | AttachmentSection disables Add Attachment button at 5 active attachments limit |

---

## 7. Known Limitations or Deferred Tests

| Item | Reason | Planned Resolution |
|------|--------|--------------------|
| Real authentication middleware tests | Authentication is out of Lab 2 scope | Addressed in Lab 3 |
| Multi-concurrent-user race condition on Ticket Number | Low risk in Lab 2 with single-instance server | Address with DB-level sequence in Lab 3 |
| IT Priority change workflow | Out of Lab 2 scope | Lab 3+ |
