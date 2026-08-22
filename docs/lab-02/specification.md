# Lab 2 Sprint Engineering Specification

> **Status:** Draft — Awaiting student review and approval before implementation begins.  
> **Last Updated:** 2026-08-22  
> **Sprint:** Lab 2 — TokTickIT Requester Ticketing MVP with UI Foundation

---

## 1. Sprint Goal

Deliver a fully functional Requester-facing ticketing experience for the TokTickIT system. By the end of this sprint a Requester — identified via a temporary Development Requester selector — can create a ticket with supporting attachments, receive an official Ticket Number, browse and search their own tickets in My Tickets, open a Ticket Detail screen, and add or soft-remove permitted attachments. A consistent Zen Green Theme and reusable component library are established for all future sprints.

---

## 2. Stakeholder Request Interpretation

The IT department needs a professional, responsive ticket submission interface. Requesters must be able to describe a problem, classify it by category and related system, attach evidence, and submit. After submission they must be able to locate, search, filter, sort, and page through their tickets, open a detail view, and manage attachments under defined rules. Because authentication is deferred to Lab 3, a Development Requester Selection screen acts as a temporary "login" mechanism for testing purposes only. The system must also enforce strict ticket ownership — no Requester may view another Requester's ticket.

---

## 3. Scope

### Included

- Development Requester Selection screen (testing mechanism, not authentication)
- Create Ticket workflow (form, validation, submission, success/error states)
- Official Ticket Number generation (backend-generated, unique)
- My Tickets screen (search, filter, sort, pagination, empty and failure states)
- Requester Ticket Detail screen (read-only header, attachment management)
- Attachment lifecycle: upload, preview, download, soft removal with reason
- Ownership enforcement: Requesters may only access their own tickets and attachments
- Zen Green Theme design tokens and reusable UI component library
- Responsive layout (desktop ≥ 992 px, tablet 768–991 px, mobile < 768 px)
- PostgreSQL schema, Prisma migrations, and idempotent seed data
- REST API for all required capabilities

### Excluded

- Authentication, login, logout, passwords, sessions, tokens, or real role-based authorization
- IT Staff dashboard, ticket queue, claiming, reassigning, or IT Priority changes
- Public Comments, Internal Notes, and Actions Taken
- Ticket status changes beyond the initial **New** status (no resolve, close, reopen, cancel)
- Administrator functions (user management, role management, reference-data management)

---

## 4. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | The system shall provide a Development Requester Selection screen that lists all active Requesters loaded from the database. |
| FR-02 | A selected Requester becomes the current testing context; their identity is displayed in the application shell throughout the session. |
| FR-03 | The application shell shall provide a "Change Requester" action that returns the user to the Development Requester Selection screen and clears the current context. |
| FR-04 | The Create Ticket screen shall allow a Requester to enter a Summary, select a Category and Related System, select a Requested Priority, enter a Description, and optionally attach files. |
| FR-05 | On successful ticket submission the backend shall generate an official Ticket Number and return it to the frontend, which shall display it in a clear success state. |
| FR-06 | The My Tickets screen shall display only the tickets owned by the currently selected Requester. |
| FR-07 | My Tickets shall support full-text search across ticket summary, category filter, requested priority filter, current status filter, sorting (by Ticket Number, Created Date, Last Updated), and pagination. |
| FR-08 | The Ticket Detail screen shall display all ticket header fields in read-only mode and list associated attachments. |
| FR-09 | A Requester may upload additional attachments to an existing ticket from the Ticket Detail screen, subject to the attachment rules. |
| FR-10 | A Requester may soft-remove one of their own permitted attachments; removal requires a removal reason and is recorded in the database. |
| FR-11 | Removed attachments shall remain visible as metadata but shall not be downloadable or previewable. |
| FR-12 | Active attachments shall be previewable (image) or downloadable (PDF and image) from the Ticket Detail screen. |
| FR-13 | The application shall display meaningful loading, empty, no-results, and failure states on every data-dependent screen. |
| FR-14 | All ticket screens shall be accessible only when a Development Requester has been selected; otherwise the user is redirected to the Development Requester Selection screen. |
| FR-15 | Direct backend access to a ticket or attachment belonging to a different Requester shall be rejected with an appropriate error response. |

---

## 5. Business Rules

| ID | Business Rule |
|----|---------------|
| BR-01 | The official Ticket Number is generated by the backend after successful creation and must be globally unique. Format: `TKT-{YEAR}-{6-digit zero-padded sequence}` (e.g. `TKT-2025-001234`). |
| BR-02 | A new Ticket begins with `Current Status = NEW`. |
| BR-03 | Lab 2 uses a Development Requester selector instead of real login. The selected identity is for testing only and is not authentication or authorization. |
| BR-04 | Only active Development Requesters (`isActive = true`) appear in the selector dropdown. Inactive Requesters are never shown. |
| BR-05 | Once a Requester is selected, their `requesterId` is stored in browser `sessionStorage` (or equivalent client-side state) and persists until "Change Requester" is triggered or the session ends. |
| BR-06 | A Ticket belongs to exactly one Requester; no Requester may read, edit, or access another Requester's Ticket or Attachments via the API. |
| BR-07 | Ticket Summary is required; minimum 5 characters, maximum 200 characters; leading and trailing whitespace is trimmed before validation and storage. |
| BR-08 | Ticket Description is required; minimum 10 characters, maximum 3000 characters; leading and trailing whitespace is trimmed before validation and storage. |
| BR-09 | Category is required; must be one of the seeded active categories (Account and Access, Hardware, Software, Network). |
| BR-10 | Related System is required; must be one of the seeded active related systems. |
| BR-11 | Requested Priority is required; allowed values: `LOW`, `MEDIUM`, `HIGH`. Default value: `MEDIUM`. |
| BR-12 | IT Priority is system-assigned; defaults to the same value as Requested Priority at creation time. It may only be changed by IT Staff (out of Lab 2 scope). |
| BR-13 | Ticket Date is system-generated at creation time (UTC timestamp stored; displayed in local timezone). |
| BR-14 | Duplicate submission prevention: the Submit button is disabled and shows a busy state while the creation request is in flight; re-enabling occurs only after a definitive success or failure response. |
| BR-15 | If ticket creation succeeds but an attachment upload subsequently fails, the ticket is preserved; the user is informed of the attachment failure and may retry the upload from the Ticket Detail screen. |
| BR-16 | Allowed attachment types: `JPG/JPEG`, `PNG`, `WEBP`, `PDF`. |
| BR-17 | Maximum attachment file size: 5 MB per file. |
| BR-18 | Maximum active (non-removed) attachments per Ticket: 5. Attempting to upload when the limit is already reached is rejected with a clear error message. |
| BR-19 | Attachment removal must be implemented as a soft delete: the record remains with `removedAt` timestamp, `removedByRequesterId`, and a mandatory non-empty `removalReason`. |
| BR-20 | A removed attachment cannot be downloaded, previewed, or accessed via the API; its metadata (filename, uploaded date) remains visible in the UI with a "Removed" indicator. |
| BR-21 | Only the owning Requester of a Ticket may remove its attachments in Lab 2. |
| BR-22 | Attachment filenames are sanitized before storage; the original filename is preserved in metadata. Files are stored using a server-generated safe filename (e.g. UUID-prefixed). |
| BR-23 | My Tickets default sort: `Created Date DESC` (newest first). Secondary sort: `Ticket Number DESC`. |
| BR-24 | Permitted page sizes for My Tickets: 10, 25, 50. Default: 10. Page numbers are 1-indexed. |
| BR-25 | An invalid or out-of-range `page` or `pageSize` query parameter results in a 400 Bad Request response with an explanatory message. |
| BR-26 | Search in My Tickets is case-insensitive and matches against Ticket Summary and Ticket Number. |
| BR-27 | When no Tickets exist for the selected Requester, My Tickets shows a dedicated empty-state UI (not a generic error). |
| BR-28 | When a search or filter yields no results, My Tickets shows a "no results" state distinct from the empty state. |
| BR-29 | All user-facing error messages must be safe (no stack traces, internal IDs, or database details exposed to the client). |
| BR-30 | In Lab 3, the Development Requester selector will be replaced by real authentication. The schema must allow a future `userId` foreign key on the Ticket table without requiring destructive migration. |

---

## 6. UI Specification Summary

> Full detail in `docs/lab-02/ui-spec.md`.

### 6.1 Application Shell

- Top navigation bar with TokTickIT logo/name (primary green `#006B3C`), **My Tickets** link, **Create Ticket** link, and a **Profile** area showing the selected Requester's name with a "Change Requester" action.
- Navigation links highlight the active route with secondary green (`#0B7A46`) underline/accent.
- Shell is always visible; ticket screens redirect to Requester Selection if no Requester is selected.

### 6.2 Development Requester Selection Screen

- Dropdown listing active Requesters loaded from the API.
- Explanatory callout: "This is for testing only and is not a login screen."
- Info callout: "In Lab 3, this selection will be replaced with secure authentication."
- Loading state while Requesters are fetched; error state with retry if fetch fails; empty state if no active Requesters exist.

### 6.3 Create Ticket Screen

- System-generated fields (`Ticket Number`, `Ticket Date`, `Requester`, `Current Status`) displayed as read-only with soft gray-green shading.
- Editable fields: `Category` (dropdown), `Related System` (dropdown), `Requested Priority` (radio or dropdown), `Summary` (text input), `Description` (textarea, resizable vertically only), `Attachments` (file picker with list).
- Required fields marked with a red asterisk (`*`).
- Validation messages appear immediately below the associated field (not only at top).
- Submit button shows busy/spinner state and is disabled while request is in flight.
- Success state: shows the generated Ticket Number prominently with a "View Ticket" and "Create Another" action.
- API failure state: displays safe error message; form values are preserved (no data loss).
- Attachment section: lists selected files with name, size, type badge, and a remove button; shows errors per-file for type/size violations.

### 6.4 My Tickets Screen

- Table layout on desktop with columns: Ticket No., Created Date, Summary, Category, Requested Priority, IT Priority, Current Status, Ticket Owner, Last Updated.
- Card layout on mobile.
- Search bar (text input) at top; filter dropdowns for Category, Requested Priority, IT Priority, Current Status.
- "Clear Filters" action when any filter is active.
- Sortable column headers with visual sort direction indicator.
- Pagination controls: Previous/Next and page number buttons; shows "Showing X to Y of Z tickets".
- Loading skeleton, empty state (no tickets yet), no-results state (search/filter returned nothing), and failure state.

### 6.5 Ticket Detail Screen

- Header section: all Ticket fields displayed read-only.
- Attachments section: lists attachments with status badge (Active / Removed).
  - Active: shows preview thumbnail (images) or file-type icon (PDF), filename, size, upload date; Download button; Remove button (opens confirmation dialog requiring a reason).
  - Removed: shows filename, upload date, removal date, removal reason; no download/preview.
- "Add Attachment" button (disabled when limit reached, with tooltip).

### 6.6 Zen Green Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary Green | `#006B3C` | App header, primary action buttons, strong emphasis |
| Secondary Green | `#0B7A46` | Active tabs, focus accents, links, hover states |
| Pale Green | `#EAF6EF` | Selected rows, success states, subtle section emphasis |
| Page Background | `#F5F7F6` | Page/body background |
| Surface | `#FFFFFF` + subtle border + restrained shadow | Cards, form panels |
| Text | Dark charcoal-green (e.g. `#1A2E22`) | Body text |
| Editable Field | White background, neutral border | Text inputs, selects |
| Read-only Field | Soft gray-green / warm ivory | System-generated fields |
| Error | Dark red text and border | Validation messages |
| Warning | Amber | Alerts, cautions |
| Success | Green with readable text | Confirmation, success banners |

### 6.7 Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| Desktop ≥ 992 px | Multi-column layout; content centered with max-width |
| Tablet 768–991 px | Two-column where practical; Summary/Description receive sufficient width |
| Mobile < 768 px | Fields stack vertically; buttons remain touch-friendly; no horizontal scroll |
| All sizes | No clipped labels, overlapping messages, hidden buttons, or unreadable attachment names |

---

## 7. Data Changes

### 7.1 Models and Tables

#### `RequesterUser` (Development Requester)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `Int` PK auto-increment | |
| `name` | `String` | Full display name |
| `email` | `String` UNIQUE | |
| `isActive` | `Boolean` default `true` | Inactive users hidden from selector |
| `createdAt` | `DateTime` | Auto-set on creation |
| `updatedAt` | `DateTime` | Auto-updated |
| `tickets` | Relation | One-to-many to `Ticket` |

#### `Category`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `Int` PK auto-increment | |
| `name` | `String` UNIQUE | e.g. "Hardware" |
| `isActive` | `Boolean` default `true` | |
| `tickets` | Relation | One-to-many to `Ticket` |

#### `RelatedSystem`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `Int` PK auto-increment | |
| `name` | `String` UNIQUE | e.g. "Campus Wi-Fi" |
| `isActive` | `Boolean` default `true` | |
| `tickets` | Relation | One-to-many to `Ticket` |

#### `Ticket`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `Int` PK auto-increment | Internal ID |
| `ticketNumber` | `String` UNIQUE | `TKT-{YEAR}-{6-digit seq}` backend-generated |
| `requesterId` | `Int` FK → `RequesterUser.id` NOT NULL | |
| `categoryId` | `Int` FK → `Category.id` NOT NULL | |
| `relatedSystemId` | `Int` FK → `RelatedSystem.id` NOT NULL | |
| `summary` | `String` | Max 200 chars |
| `description` | `String` | Max 3000 chars |
| `requestedPriority` | `Enum(LOW,MEDIUM,HIGH)` | |
| `itPriority` | `Enum(LOW,MEDIUM,HIGH)` | Defaults to `requestedPriority` |
| `currentStatus` | `Enum(NEW,OPEN,IN_PROGRESS,RESOLVED,CLOSED)` | Defaults to `NEW` |
| `ticketOwnerId` | `Int` FK → `RequesterUser.id` NULLABLE | IT Staff assignment (Lab 3+) |
| `createdAt` | `DateTime` | Auto-set |
| `updatedAt` | `DateTime` | Auto-updated |
| `attachments` | Relation | One-to-many to `Attachment` |

#### `Attachment`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `Int` PK auto-increment | |
| `ticketId` | `Int` FK → `Ticket.id` NOT NULL | |
| `uploaderId` | `Int` FK → `RequesterUser.id` NOT NULL | |
| `originalFilename` | `String` | Preserved for display |
| `storedFilename` | `String` | UUID-prefixed safe filename |
| `mimeType` | `String` | e.g. `image/jpeg` |
| `sizeBytes` | `Int` | File size in bytes |
| `storagePath` | `String` | Server-side path or storage key |
| `removedAt` | `DateTime` NULLABLE | NULL = active; non-NULL = soft-removed |
| `removedByRequesterId` | `Int` FK → `RequesterUser.id` NULLABLE | |
| `removalReason` | `String` NULLABLE | Required when removed |
| `createdAt` | `DateTime` | Auto-set |

### 7.2 Relationships

- `RequesterUser` 1 to N `Ticket` (via `requesterId`)
- `Ticket` 1 to N `Attachment`
- `Category` 1 to N `Ticket`
- `RelatedSystem` 1 to N `Ticket`

### 7.3 Indexes

| Table | Index | Justification |
|-------|-------|---------------|
| `Ticket` | `requesterId` | My Tickets query always filters by Requester |
| `Ticket` | `ticketNumber` UNIQUE | Fast lookup and uniqueness enforcement |
| `Ticket` | `currentStatus`, `categoryId`, `requestedPriority` | Filter operations on My Tickets |
| `Ticket` | `createdAt`, `updatedAt` | Sort operations on My Tickets |
| `Attachment` | `ticketId` | Attachment list always scoped to one Ticket |

### 7.4 Seed Data

The seed is idempotent (uses `upsert` or existence checks):

**Categories (4):** Account and Access, Hardware, Software, Network.

**Related Systems (6+):** Email, Campus Wi-Fi, VPN, LEB2 App, Grade Submission App, Printer, Corporate Laptop.

**Active Development Requesters (4):**
- Jennifer Anderson — jennifer.anderson@example.com
- Michael Brown — michael.brown@example.com
- Sarah Johnson — sarah.johnson@example.com
- David Lee — david.lee@example.com

**Inactive Development Requester (1):**
- Alex Turner — alex.turner@example.com (`isActive = false`)

---

## 8. API Contract

> Full detail with request/response examples in `docs/lab-02/api-spec.md`.

### 8.1 Endpoint Summary

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/requesters` | Retrieve all active Development Requesters |
| `GET` | `/api/categories` | Retrieve all active Categories |
| `GET` | `/api/related-systems` | Retrieve all active Related Systems |
| `POST` | `/api/tickets` | Create a Ticket for the selected Requester |
| `GET` | `/api/tickets` | Retrieve paginated Ticket list for a Requester |
| `GET` | `/api/tickets/:ticketNumber` | Retrieve one owned Ticket by Ticket Number |
| `POST` | `/api/tickets/:ticketNumber/attachments` | Upload an Attachment to a Ticket |
| `GET` | `/api/tickets/:ticketNumber/attachments` | Retrieve Attachment metadata for a Ticket |
| `GET` | `/api/attachments/:id/download` | Download an active Attachment |
| `DELETE` | `/api/attachments/:id` | Soft-remove an Attachment |

### 8.2 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Successful retrieval or update |
| 201 | Resource created successfully |
| 400 | Invalid input or constraint violation |
| 403 | Ownership check failed |
| 404 | Resource not found |
| 409 | Conflict (e.g. attachment limit reached) |
| 413 | File too large |
| 415 | Unsupported file type |
| 500 | Unexpected server error (safe message only) |

---

## 9. Acceptance Criteria

| ID | Given / When / Then |
|----|---------------------|
| AC-01 | Given valid Ticket data, when the Requester submits the Create Ticket form, then one Ticket is saved, the official Ticket Number is displayed on the success screen, and the stored `requesterId` matches the selected Requester. |
| AC-02 | Given no Development Requester is selected, when the user navigates to My Tickets or Create Ticket, then the Development Requester Selection screen is shown. |
| AC-03 | Given Requester B is selected, when a Ticket belonging to Requester A is requested via the API, then a 403 response is returned and the Ticket data is not exposed. |
| AC-04 | Given an active Category list, when the Create Ticket screen loads, then the Category dropdown is populated from the database. |
| AC-05 | Given a Requester submits a form with an empty or too-short Summary, when the form is submitted, then a field-level validation message appears below the Summary field and the API is not called. |
| AC-06 | Given valid Ticket data and an attachment that exceeds 5 MB, when the Requester selects it, then a per-file error is shown and the attachment is not included in the submission. |
| AC-07 | Given valid Ticket data and an attachment of unsupported type, when the Requester selects it, then a per-file error is shown and the attachment is not included in the submission. |
| AC-08 | Given the backend is unavailable, when the Requester submits a Ticket, then a safe error message is shown and all form field values are preserved. |
| AC-09 | Given Requester A has tickets, when Requester B is selected and My Tickets is opened, then only Requester B's tickets are shown. |
| AC-10 | Given My Tickets with results, when the Requester searches for a keyword, then only Tickets whose Summary or Ticket Number contains that keyword (case-insensitive) are displayed. |
| AC-11 | Given My Tickets with results, when a Category filter is applied, then only Tickets of that Category are shown. |
| AC-12 | Given My Tickets, when the Requester clicks a sortable column header, then the list is sorted by that column; clicking again reverses the order. |
| AC-13 | Given more than 10 tickets, when the Requester navigates to page 2, then the correct next page of tickets is shown and pagination metadata is accurate. |
| AC-14 | Given no Tickets exist for the selected Requester, when My Tickets loads, then a dedicated empty-state UI is displayed (not an error). |
| AC-15 | Given a search that returns no matching Tickets, then a "no results" state distinct from the empty state is displayed. |
| AC-16 | Given an owned Ticket, when the Requester opens Ticket Detail, then all header fields are displayed read-only and existing attachments are listed. |
| AC-17 | Given a Ticket with 4 active attachments, when the Requester uploads a valid attachment, then the 5th attachment is saved and appears in the list. |
| AC-18 | Given a Ticket with 5 active attachments, when the Requester attempts to upload another, then a 409 response is returned and the UI shows a clear error. |
| AC-19 | Given an active attachment, when the Requester downloads it, then the file is served correctly. |
| AC-20 | Given a Requester soft-removes an attachment with a reason, then the attachment's `removedAt` is set, the reason is stored, and the attachment is no longer downloadable. |
| AC-21 | Given a removed attachment, when the Requester attempts to download it via direct URL, then a 403 or 404 response is returned. |
| AC-22 | Given a mobile viewport (less than 768 px), when the My Tickets screen is displayed, then tickets are shown in card layout with no horizontal scrolling. |
| AC-23 | Given any viewport size, when the Create Ticket form has validation errors, then validation messages are visible and not clipped. |
| AC-24 | Given the Development Requester Selection screen, when loading fails, then a safe error message with a retry action is shown. |
| AC-25 | Given no active Requesters exist, when the Development Requester Selection screen loads, then an appropriate empty state is shown. |

---

## 10. Definition of Done

### 10.1 Product Completion (used by the AI Coding Agent)

- [ ] All FR-01 through FR-15 are implemented and verified.
- [ ] All Business Rules BR-01 through BR-30 are enforced in frontend and/or backend.
- [ ] All Acceptance Criteria AC-01 through AC-25 have passing automated test evidence.
- [ ] Prisma schema matches the data model in Section 7; migration runs cleanly on a fresh database.
- [ ] Seed data is idempotent and covers all required categories, related systems, and requesters.
- [ ] All REST API endpoints in Section 8 are implemented, validated, and return documented status codes.
- [ ] Development Requester Selection screen is functional, labeled as a testing mechanism, and redirects correctly.
- [ ] Create Ticket form validates all fields, shows field-level messages, preserves data on failure, and shows busy/success states.
- [ ] My Tickets: search, filter, sort, and pagination work correctly; all states (loading, empty, no-results, failure) are implemented.
- [ ] Ticket Detail: all fields read-only; attachments listed with correct states; add, download, and soft-remove work per rules.
- [ ] Ownership enforcement: accessing another Requester's ticket or attachment returns 403.
- [ ] Attachment rules (type, size, count limit, soft removal) are enforced in both frontend and backend.
- [ ] Zen Green Theme is applied consistently; color tokens match specification.
- [ ] Responsive layout is correct at desktop, tablet, and mobile viewports; no clipping or horizontal overflow.
- [ ] All planned automated tests (unit, API, UI component, responsive, E2E) pass from the documented commands.
- [ ] No required test is skipped, disabled, or commented out.
- [ ] README setup and test instructions are current and accurate.
- [ ] `docs/lab-02/specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` are complete and match the implementation.

### 10.2 Course Delivery Requirements

- [ ] All work is on feature branches merged into `lab2-staging` via reviewed Pull Requests.
- [ ] `lab2-staging` is merged to `main` via a release Pull Request after integration testing.
- [ ] No direct commits to `main` or `lab2-staging`.
- [ ] Each feature branch corresponds to a GitHub Issue.
- [ ] All GitHub Issues are in the **Done** column of the Kanban board.
- [ ] Peer review comments are given and received; responses are documented.
- [ ] `docs/lab-02/reviewer.md` is complete.
- [ ] `docs/lab-02/ai-use.md` is complete with reflection.
- [ ] PDF submission evidence covers all 9 required parts.
- [ ] Playwright screenshots at desktop, tablet, and mobile viewports are saved to `artifacts/lab-02/screenshots/`.

---

## 11. Assumptions and Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Requester selection is stored in browser `sessionStorage` so it clears when the tab is closed. | Prevents stale Requester state across sessions; matches the "testing context" intent. |
| 2 | Ticket Number format: `TKT-{YEAR}-{6-digit zero-padded sequence}`. Unique DB constraint prevents duplicates under race conditions. | Matches the UI mockup shown in the labsheet; human-readable. |
| 3 | `itPriority` defaults to the same value as `requestedPriority` at creation time. | Avoids leaving IT Priority null while deferring IT Staff features. |
| 4 | Soft-removed attachments are excluded from the active count (BR-18) but remain in the metadata list (BR-19, BR-20). | Ensures the 5-attachment limit applies only to active files. |
| 5 | `ticketOwnerId` is added as a nullable foreign key for forward compatibility with Lab 3+ IT Staff features. | No destructive migration required later. |
| 6 | My Tickets search is server-side (Prisma `contains` / DB `ILIKE`), not client-side. | Ensures correct pagination and avoids loading all tickets to the client. |
| 7 | File storage uses the local filesystem in Lab 2; the `storagePath` field abstracts the storage backend for future migration. | Simplicity for Lab 2 scope. |
| 8 | Summary: min 5 chars, max 200 chars. Description: min 10 chars, max 3000 chars. | Consistent with common IT ticketing conventions; prevents trivially short entries. |
