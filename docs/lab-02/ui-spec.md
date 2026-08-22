# Lab 2 UI Specification

> **Status:** Draft — Awaiting student review and approval before implementation begins.  
> **Last Updated:** 2026-08-22  
> **References:** `specification.md` Section 6, Lab_02_labsheet.md Sections 7–8

---

## 1. Design System: Zen Green Theme

### 1.1 Color Tokens

| Token Name | Hex Value | Tailwind Custom / CSS Variable | Usage |
|-----------|-----------|-------------------------------|-------|
| `green-primary` | `#006B3C` | `--color-primary` | App header background, primary action buttons, strong emphasis |
| `green-secondary` | `#0B7A46` | `--color-secondary` | Active nav links, focus rings, link text, hover states |
| `green-pale` | `#EAF6EF` | `--color-pale` | Selected rows, success backgrounds, subtle section emphasis |
| `page-bg` | `#F5F7F6` | `--color-page-bg` | Page / body background |
| `surface` | `#FFFFFF` | `--color-surface` | Cards, panels, modals |
| `text-primary` | `#1A2E22` | `--color-text` | Body text, labels (charcoal-green, not pure black) |
| `text-muted` | `#4A6355` | `--color-text-muted` | Helper text, secondary labels |
| `border-default` | `#D1E0D8` | `--color-border` | Input borders, card borders |
| `readonly-bg` | `#F0F4F1` | `--color-readonly` | Read-only / system-generated field backgrounds |
| `error-text` | `#B91C1C` | `--color-error-text` | Validation error text |
| `error-border` | `#DC2626` | `--color-error-border` | Validation error field border |
| `warning-bg` | `#FFFBEB` | `--color-warning-bg` | Warning callout background |
| `warning-text` | `#92400E` | `--color-warning-text` | Warning callout text |
| `success-bg` | `#ECFDF5` | `--color-success-bg` | Success banner background |
| `success-text` | `#065F46` | `--color-success-text` | Success banner text |

### 1.2 Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Page title (H1) | System sans-serif (e.g. Inter) | 700 | 24px / 1.5rem |
| Section heading (H2) | System sans-serif | 600 | 20px / 1.25rem |
| Card / panel heading (H3) | System sans-serif | 600 | 16px / 1rem |
| Label | System sans-serif | 500 | 14px / 0.875rem |
| Body / input text | System sans-serif | 400 | 14px / 0.875rem |
| Helper / error text | System sans-serif | 400 | 12px / 0.75rem |
| Badge text | System sans-serif | 600 | 12px / 0.75rem |

### 1.3 Spacing

- Base unit: **4px** (Tailwind default spacing scale).
- Form field vertical gap: **16px** between label+input groups.
- Section gap: **24px**.
- Card padding: **16px** (mobile) / **24px** (desktop).

### 1.4 Border Radius and Shadow

- Inputs, selects, textareas: `border-radius: 6px`.
- Cards / panels: `border-radius: 8px`.
- Buttons: `border-radius: 6px`.
- Card shadow: `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`.
- Modal: `box-shadow: 0 4px 16px rgba(0,0,0,0.16)`.

---

## 2. Application Shell

### 2.1 Top Navigation Bar

```
┌──────────────────────────────────────────────────────────────────┐
│ 🟢 TokTickIT │  My Tickets   Create Ticket    👤 Jennifer A. ▾  │
└──────────────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Background | `green-primary` (`#006B3C`) |
| Logo/brand text | White, font-weight 700 |
| Nav links | White text; active link has a white underline or `green-secondary` accent |
| Profile area | Shows selected Requester name + dropdown caret; white text |
| "Change Requester" | Appears as a menu item in the profile dropdown |
| Height | 56px (desktop), 48px (mobile) |
| Max-width | 1280px centered |

### 2.2 Guard Behavior

- If no Requester is selected in `sessionStorage`, **all routes except `/select-requester`** redirect to the Development Requester Selection screen.
- The redirect preserves the intended destination so the user is forwarded there after selection.

---

## 3. Development Requester Selection Screen

### 3.1 Layout

```
┌─────────────────────────────────────┐
│ Development Requester Selection     │
│ ─────────────────────────────────── │
│ Choose a development requester to   │
│ simulate the current requester      │
│ context for Lab 2.                  │
│                                     │
│ Development Requester *             │
│ [ Jennifer Anderson          ▾ ]    │
│                                     │
│ ℹ Only active development           │
│   requesters are shown.             │
│                                     │
│ 🔒 Authentication coming in Lab 3   │
│   In Lab 3, this selection will be  │
│   replaced with secure auth.        │
│                                     │
│ [ Select Requester (primary btn) ]  │
└─────────────────────────────────────┘
```

### 3.2 States

| State | Behavior |
|-------|----------|
| **Loading** | Dropdown shows a spinner/skeleton; Select button is disabled |
| **Loaded** | Dropdown lists active Requesters by name |
| **Error** | Error callout with message + "Retry" button |
| **Empty** | Callout: "No active requesters available. Please contact an administrator." |

### 3.3 Behavior

- Dropdown lists only `isActive = true` Requesters.
- On "Select Requester": save `requesterId` and `requesterName` to `sessionStorage`; navigate to My Tickets (or the intended destination).
- The "This is for testing only" callout must always be visible — use a `warning` style callout.
- The "Lab 3" info must be visible — use an `info` style callout.

---

## 4. Create Ticket Screen

### 4.1 States

| State | Description |
|-------|-------------|
| **Initial** | Empty form; reference dropdowns loaded; system fields shown as read-only placeholders |
| **Loading reference data** | Dropdowns show loading indicator |
| **Reference data error** | Error message with Retry; form cannot be submitted |
| **Validation error** | Field-level error messages appear below each invalid field |
| **Submitting** | Submit button shows spinner text ("Submitting…") and is disabled; all fields are disabled |
| **Success** | Success banner with Ticket Number; "View Ticket" and "Create Another" actions |
| **API failure** | Error banner at top; form values preserved; Submit re-enabled |
| **Invalid attachment** | Per-file error message below the attachment list item |

### 4.2 Desktop Layout (≥ 992px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Create Ticket                                                    │
├──────────────────────────┬──────────────────────────────────────┤
│ Ticket Number (read-only)│ Ticket Date (read-only)             │
├──────────────────────────┴──────────────────────────────────────┤
│ Requester (read-only — from selected context)                   │
├──────────────────────────┬──────────────────────────────────────┤
│ Category *               │ Related System *                     │
├──────────────────────────┴──────────────────────────────────────┤
│ Requested Priority *  ○ Low   ● Medium   ○ High                 │
├─────────────────────────────────────────────────────────────────┤
│ Summary *                                                       │
│ [ text input — full width ]                                     │
├─────────────────────────────────────────────────────────────────┤
│ Description *                                                   │
│ [ textarea — full width, min 4 rows, resizable vertically ]     │
├─────────────────────────────────────────────────────────────────┤
│ Attachments (optional)                                          │
│ [ + Add Files ] (JPG, PNG, WEBP, PDF — max 5 MB each)          │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ 📎 screenshot.png  1.2 MB  [PNG]  [✕ Remove]            │   │
│ │ ⚠ report.exe — Unsupported file type                     │   │
│ └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                              [ Cancel ]  [ Submit Ticket (🟢) ] │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Field Specifications

| Field | Type | Required | Read-only | Validation |
|-------|------|----------|-----------|------------|
| Ticket Number | Text | — | ✅ System-generated | Shown as placeholder "Assigned after submission" |
| Ticket Date | Text | — | ✅ System-generated | Shown as placeholder "Assigned after submission" |
| Requester | Text | — | ✅ From context | Shows selected Requester name |
| Current Status | Text | — | ✅ Default: NEW | Always shows "New" |
| Category | Select | ✅ | — | Must select a valid active category |
| Related System | Select | ✅ | — | Must select a valid active related system |
| Requested Priority | Radio/Select | ✅ | — | LOW / MEDIUM / HIGH; default: MEDIUM |
| Summary | Text input | ✅ | — | Min 5, max 200 chars; trimmed |
| Description | Textarea | ✅ | — | Min 10, max 3000 chars; trimmed |
| Attachments | File picker | — | — | JPG/JPEG/PNG/WEBP/PDF; max 5 MB; max 5 files |

### 4.4 Attachment Section Rules

- Files are validated client-side before upload (type and size).
- Invalid files show a per-file error below the file row; they are NOT submitted.
- Valid files show name, size, type badge, and a remove (✕) button.
- Maximum 5 files selectable before submission. Attempting to add more shows inline error.
- After successful ticket creation, valid attachments are uploaded. If an upload fails, the ticket is preserved and the user is shown an attachment-specific error with a link to the Ticket Detail to retry.

### 4.5 Success State

```
┌─────────────────────────────────────────────┐
│ ✅ Ticket Created Successfully               │
│                                             │
│ Your ticket has been submitted.             │
│ Ticket Number: TKT-2025-001234              │
│                                             │
│ [ View Ticket ]   [ Create Another Ticket ] │
└─────────────────────────────────────────────┘
```

---

## 5. My Tickets Screen

### 5.1 Desktop Layout (≥ 992px)

```
My Tickets                              [ + Create Ticket ]
View and track all of your support requests.
──────────────────────────────────────────────────────────
[ 🔍 Search tickets…         ]  [Clear Filters]
Category: [All ▾]  Priority: [All ▾]  Status: [All ▾]
──────────────────────────────────────────────────────────
Ticket No.↕ | Created Date↕ | Summary | Category | Req. Priority | IT Priority | Status | Owner | Updated↕
TKT-2025-001234 | May 12, 2025 | Laptop battery... | Hardware | Medium | Medium | In Progress | M. Brown | May 13
...
──────────────────────────────────────────────────────────
Showing 1 to 10 of 42 tickets   [← Prev]  [1] [2] [3] ... [5]  [Next →]
```

### 5.2 Table Columns

| Column | Sortable | Default Sort |
|--------|----------|-------------|
| Ticket No. | ✅ | Secondary DESC |
| Created Date | ✅ | **Primary DESC** |
| Summary | — | — |
| Category | — | — |
| Requested Priority | — | — |
| IT Priority | — | — |
| Current Status | — | — |
| Ticket Owner | — | — |
| Last Updated | ✅ | — |

- Sortable columns show `↕` (neutral), `↑` (asc), `↓` (desc) icons.
- Clicking a column header sorts by that column; clicking again reverses order.

### 5.3 Filters and Search

| Control | Behavior |
|---------|----------|
| Search box | Case-insensitive match against Summary and Ticket Number; debounced 300ms |
| Category filter | Dropdown with "All Categories" + seeded categories |
| Requested Priority filter | "All Priorities" + LOW / MEDIUM / HIGH |
| IT Priority filter | "All Priorities" + LOW / MEDIUM / HIGH |
| Current Status filter | "All Statuses" + NEW / OPEN / IN_PROGRESS / RESOLVED / CLOSED |
| Clear Filters button | Visible when any filter is active; resets all filters and search |

### 5.4 Pagination

- Default page size: **10**.
- Page size options: 10, 25, 50 (shown as a select if desired).
- Pagination bar shows: ← Prev, page numbers (with ellipsis for large page counts), Next →.
- Shows "Showing X to Y of Z tickets" text.

### 5.5 States

| State | Description |
|-------|-------------|
| **Loading** | Skeleton rows (animated placeholder rows in the table) |
| **Empty** | No tickets yet: icon + "You have not submitted any tickets yet." + "Create Ticket" button |
| **No Results** | Search/filter returned nothing: icon + "No tickets match your search." + "Clear Filters" link |
| **Error** | API failure: warning banner + "Retry" button |

### 5.6 Mobile Layout (< 768px)

- Replace table with **ticket cards**. Each card shows:
  - Ticket Number (prominent) + Date
  - Summary (truncated to 2 lines)
  - Category badge + Status badge
  - Last Updated
- Cards are stacked vertically, full width.
- Search and filters collapse into a "Filters" toggle button.
- No horizontal scrolling.

### 5.7 Ticket Row / Card Click

- Clicking a row (desktop) or card (mobile) navigates to the Ticket Detail screen.

---

## 6. Ticket Detail Screen

### 6.1 Layout

```
← Back to My Tickets
─────────────────────────────────────────────
Ticket No. TKT-2025-001234     [read-only fields]
Ticket Date: May 12, 2025 09:14 AM
Category: Hardware       Related System: Corporate Laptop
Requester: Jennifer Anderson
Requested Priority: [Medium badge]   IT Priority: [Medium badge]
Current Status: [In Progress badge]
Ticket Owner: Michael Brown (IT Support)
─────────────────────────────────────────────
Summary
Laptop battery drains quickly
─────────────────────────────────────────────
Description
My laptop battery is draining much faster than usual...
─────────────────────────────────────────────
Attachments (2 active)                [ + Add Attachment ]
┌─────────────────────────────────────────────────────────┐
│ 🖼 screenshot.png   1.2 MB   May 12, 2025  [↓ Download] [🗑 Remove] │
│ 📄 report.pdf       0.8 MB   May 12, 2025  [↓ Download] [🗑 Remove] │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│ [REMOVED] old-screenshot.png  Removed: May 13  Reason: Duplicate │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Header Fields (All Read-Only)

All header fields use `readonly-bg` (`#F0F4F1`) background and are clearly distinguished from editable inputs.

### 6.3 Priority and Status Badges

| Value | Badge Style |
|-------|-------------|
| LOW priority | Gray badge |
| MEDIUM priority | Amber/yellow badge |
| HIGH priority | Orange/red badge |
| NEW status | Blue-gray badge |
| OPEN status | Blue badge |
| IN_PROGRESS status | Amber badge |
| RESOLVED status | Green badge |
| CLOSED status | Gray badge |

Badges must not rely on color alone — include text label.

### 6.4 Attachment States

| State | Visual |
|-------|--------|
| **Active** | Thumbnail (image) or file-type icon (PDF); filename; size; upload date; Download button; Remove button |
| **Uploading** | Progress bar or spinner; filename; "Uploading…" text; Cancel button |
| **Upload Error** | Error icon; filename; error message; Retry button |
| **Removed** | Struck-through or dimmed filename; "REMOVED" badge; removal date; removal reason; no download button |
| **Limit Reached** | "Add Attachment" button is disabled with tooltip: "Maximum 5 attachments reached" |

### 6.5 Remove Attachment Dialog

```
┌──────────────────────────────────────┐
│ Remove Attachment                    │
│ ────────────────────────────────────│
│ Are you sure you want to remove      │
│ "screenshot.png"?                    │
│                                      │
│ Removal Reason *                     │
│ [ text input — required ]            │
│                                      │
│ ⚠ This action cannot be undone.     │
│ The file will no longer be           │
│ accessible after removal.            │
│                                      │
│ [ Cancel ]  [ Remove (destructive) ] │
└──────────────────────────────────────┘
```

- Removal Reason is required (minimum 5 characters).
- "Remove" button is disabled until a reason is entered.
- After successful removal: dialog closes; attachment row updates to "Removed" state without page reload.

---

## 7. Button Hierarchy

| Tier | Style | Usage |
|------|-------|-------|
| **Primary** | `green-primary` background, white text | Main call-to-action (Submit Ticket, Select Requester, Confirm) |
| **Secondary** | White background, `green-primary` border + text | Supporting actions (View Ticket, Add Attachment) |
| **Tertiary / Link** | No background/border, `green-secondary` text | Low-emphasis actions (Cancel, Clear Filters, Back) |
| **Destructive** | Dark red background, white text | Remove Attachment confirm |
| **Disabled** | Light gray background, muted text, `cursor: not-allowed` | Any button in non-interactive state |
| **Busy** | Primary style + spinner icon + disabled | Submit during API call |

---

## 8. Component Rules

- Labels appear **above** their control with consistent font weight (500) and 4px spacing.
- Required fields show a red asterisk (`*`) after the label. The asterisk alone does not replace a validation message.
- All inputs use a consistent height of **40px** (single-line). Textarea minimum height: **120px**.
- Textarea is resizable **vertically only** (CSS `resize: vertical`); resizing must not break the layout.
- Every icon-only button requires an `aria-label` and a tooltip.
- Disabled controls are visually distinct (gray) and cannot be focused or activated.
- Focus indicators (visible outline) must remain visible for keyboard users at all times — do not suppress `:focus-visible`.
- Validation messages appear **immediately below the associated field**, not only as a summary at the top.

---

## 9. Accessibility

- Semantic HTML: `<nav>`, `<main>`, `<form>`, `<button>`, `<label for="...">`.
- All images and icons have meaningful `alt` text or `aria-hidden="true"` (decorative).
- Color is never the sole indicator — badges include text; errors include icons or text in addition to red color.
- Form errors are announced via `aria-live` or linked via `aria-describedby`.
- Modals trap focus while open and restore focus to the trigger on close.
- Keyboard: all interactive elements are reachable and operable via Tab / Shift+Tab / Enter / Space.

---

## 10. Responsive Rules Summary

| Viewport | Key Rules |
|----------|-----------|
| Desktop ≥ 992px | Two-column form layout for side-by-side fields; full data table in My Tickets; max-width 1280px centered |
| Tablet 768–991px | Two-column where practical (single column for Summary, Description, Attachments); My Tickets table may horizontally scroll within a constrained container or use card layout |
| Mobile < 768px | All form fields stack to full width; My Tickets uses card layout; buttons are ≥ 44px touch target; no horizontal page scrolling |
| All | No clipped labels, no overlapping messages, no hidden buttons, no unreadable attachment names at any viewport |

---

## 11. Visual Inspection Checklist

After implementation, verify each item visually at all three viewports (desktop, tablet, mobile).

### 11.1 Colors and Typography

- [ ] App header uses `#006B3C` background.
- [ ] Primary buttons use `#006B3C`.
- [ ] Active nav link has `#0B7A46` accent or underline.
- [ ] Page background is `#F5F7F6` or similarly quiet near-white.
- [ ] Cards/panels are white with subtle border and shadow.
- [ ] Read-only fields use `#F0F4F1` background (clearly distinct from editable fields).
- [ ] Error messages use dark red text (`#B91C1C`) and red border.
- [ ] Body text is dark charcoal-green, not pure black.

### 11.2 Form States

- [ ] Required field asterisks are visible and red.
- [ ] Validation messages appear immediately below the invalid field.
- [ ] Editable and read-only fields are visually distinct.
- [ ] Submit button shows spinner and is disabled while submitting.
- [ ] Form values are preserved after an API failure.
- [ ] Success state clearly shows the generated Ticket Number.

### 11.3 My Tickets

- [ ] Desktop: full table with all required columns.
- [ ] Mobile: ticket cards with no horizontal scrolling.
- [ ] Sort indicators (↕ / ↑ / ↓) visible on sortable columns.
- [ ] "Clear Filters" button appears only when a filter is active.
- [ ] Empty state and no-results state are visually distinct.
- [ ] Pagination shows correct "Showing X to Y of Z" text.

### 11.4 Ticket Detail

- [ ] All header fields are visually read-only (different background).
- [ ] Priority and status badges are consistent with Section 6.3.
- [ ] Active attachments show Download and Remove buttons.
- [ ] Removed attachments show "REMOVED" badge and no download option.
- [ ] "Add Attachment" button is disabled and shows tooltip when limit is reached.

### 11.5 Responsive

- [ ] No horizontal page scrolling at any viewport.
- [ ] No clipped labels or overlapping elements at tablet or mobile.
- [ ] Buttons have sufficient touch target size (≥ 44px) on mobile.
- [ ] Navigation bar is usable on mobile (hamburger or condensed layout).

---

## 12. Screenshot Paths

| Screen | Path |
|--------|------|
| Development Requester Selection | `artifacts/lab-02/screenshots/requester-selection/` |
| Create Ticket — Initial | `artifacts/lab-02/screenshots/create-ticket/initial.png` |
| Create Ticket — Validation Error | `artifacts/lab-02/screenshots/create-ticket/validation-error.png` |
| Create Ticket — Submitting | `artifacts/lab-02/screenshots/create-ticket/submitting.png` |
| Create Ticket — Success | `artifacts/lab-02/screenshots/create-ticket/success.png` |
| Create Ticket — API Failure | `artifacts/lab-02/screenshots/create-ticket/api-failure.png` |
| Create Ticket — Invalid Attachment | `artifacts/lab-02/screenshots/create-ticket/invalid-attachment.png` |
| My Tickets — Desktop | `artifacts/lab-02/screenshots/my-tickets/desktop.png` |
| My Tickets — Tablet | `artifacts/lab-02/screenshots/my-tickets/tablet.png` |
| My Tickets — Mobile | `artifacts/lab-02/screenshots/my-tickets/mobile.png` |
| My Tickets — Empty State | `artifacts/lab-02/screenshots/my-tickets/empty.png` |
| My Tickets — No Results | `artifacts/lab-02/screenshots/my-tickets/no-results.png` |
| Ticket Detail — Desktop | `artifacts/lab-02/screenshots/ticket-detail/desktop.png` |
| Ticket Detail — Attachments | `artifacts/lab-02/screenshots/ticket-detail/attachments.png` |
| Ticket Detail — Remove Dialog | `artifacts/lab-02/screenshots/ticket-detail/remove-dialog.png` |
