# Lab 2 API Specification

> **Status:** Draft — Awaiting student review and approval before implementation begins.  
> **Last Updated:** 2026-08-22  
> **Base URL:** `/api`  
> **Content-Type:** `application/json` (except file upload endpoints which use `multipart/form-data`)

---

## 1. HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Successful retrieval or update |
| 201 | Resource created successfully |
| 400 | Validation failure or invalid query parameter |
| 403 | Ownership check failed (accessing another Requester's resource) |
| 404 | Resource not found |
| 409 | Conflict (e.g. attachment limit reached) |
| 413 | Payload too large (file exceeds 5 MB) |
| 415 | Unsupported media type (invalid file type) |
| 500 | Unexpected server error — safe generic message only |

---

## 2. Common Error Response Shape

All error responses follow this shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable safe message.",
    "details": [
      { "field": "summary", "message": "Summary is required." }
    ]
  }
}
```

- `details` is present only for validation errors (400). It is omitted for 403, 404, 409, 413, 415, 500.
- No stack traces, internal IDs, or database error messages are ever exposed.

---

## 3. Reference Data Endpoints

### 3.1 GET `/api/requesters`

**Purpose:** Retrieve all active Development Requesters for the selector dropdown.

**Request:** No parameters.

**Success Response — 200**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Jennifer Anderson", "email": "jennifer.anderson@example.com" },
    { "id": 2, "name": "Michael Brown",     "email": "michael.brown@example.com" },
    { "id": 3, "name": "Sarah Johnson",     "email": "sarah.johnson@example.com" },
    { "id": 4, "name": "David Lee",         "email": "david.lee@example.com" }
  ]
}
```

- Only `isActive = true` Requesters are returned.
- Ordered by `name ASC`.

**Error Cases:**

| Status | Scenario |
|--------|----------|
| 500 | Unexpected database error |

---

### 3.2 GET `/api/categories`

**Purpose:** Retrieve all active Ticket Categories.

**Success Response — 200**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Account and Access" },
    { "id": 2, "name": "Hardware" },
    { "id": 3, "name": "Network" },
    { "id": 4, "name": "Software" }
  ]
}
```

- Only `isActive = true` categories are returned. Ordered by `name ASC`.

---

### 3.3 GET `/api/related-systems`

**Purpose:** Retrieve all active Related Systems.

**Success Response — 200**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Campus Wi-Fi" },
    { "id": 2, "name": "Corporate Laptop" },
    { "id": 3, "name": "Email" },
    { "id": 4, "name": "Grade Submission App" },
    { "id": 5, "name": "LEB2 App" },
    { "id": 6, "name": "Printer" },
    { "id": 7, "name": "VPN" }
  ]
}
```

- Only `isActive = true` systems are returned. Ordered by `name ASC`.

---

## 4. Ticket Endpoints

### 4.1 POST `/api/tickets`

**Purpose:** Create a new Ticket for the selected Development Requester.

**Request Body:**

```json
{
  "requesterId": 1,
  "categoryId": 2,
  "relatedSystemId": 3,
  "requestedPriority": "MEDIUM",
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual even when the system is idle. This started happening after last week's Windows update.",
  "attachments": []
}
```

> Note: `attachments` are uploaded separately after ticket creation (see Section 5.1). The field may be omitted or an empty array.

**Validation Rules (backend enforced):**

| Field | Rule |
|-------|------|
| `requesterId` | Required; must be an active Requester ID |
| `categoryId` | Required; must be an active Category ID |
| `relatedSystemId` | Required; must be an active RelatedSystem ID |
| `requestedPriority` | Required; must be `LOW`, `MEDIUM`, or `HIGH` |
| `summary` | Required; trimmed length 5–200 characters |
| `description` | Required; trimmed length 10–3000 characters |

**Success Response — 201**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "ticketNumber": "TKT-2026-000042",
    "requesterId": 1,
    "categoryId": 2,
    "relatedSystemId": 3,
    "summary": "Laptop battery drains quickly",
    "description": "My laptop battery is draining much faster...",
    "requestedPriority": "MEDIUM",
    "itPriority": "MEDIUM",
    "currentStatus": "NEW",
    "ticketOwnerId": null,
    "createdAt": "2026-08-22T07:54:00.000Z",
    "updatedAt": "2026-08-22T07:54:00.000Z"
  }
}
```

**Error Cases:**

| Status | Code | Scenario |
|--------|------|----------|
| 400 | `VALIDATION_ERROR` | Any required field missing, invalid, or out-of-range |
| 400 | `INVALID_REQUESTER` | `requesterId` is inactive or does not exist |
| 400 | `INVALID_CATEGORY` | `categoryId` does not exist or is inactive |
| 400 | `INVALID_RELATED_SYSTEM` | `relatedSystemId` does not exist or is inactive |
| 500 | `SERVER_ERROR` | Unexpected error during creation |

---

### 4.2 GET `/api/tickets`

**Purpose:** Retrieve a paginated list of Tickets belonging to the specified Requester.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `requesterId` | integer | **required** | ID of the selected Development Requester |
| `search` | string | — | Case-insensitive match on Summary and Ticket Number |
| `category` | string | — | Filter by Category name (exact match) |
| `requestedPriority` | string | — | Filter: `LOW`, `MEDIUM`, or `HIGH` |
| `itPriority` | string | — | Filter: `LOW`, `MEDIUM`, or `HIGH` |
| `status` | string | — | Filter: `NEW`, `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` |
| `sort` | string | `createdAt` | Sort field: `ticketNumber`, `createdAt`, `updatedAt` |
| `order` | string | `desc` | Sort order: `asc` or `desc` |
| `page` | integer | `1` | Page number (1-indexed) |
| `pageSize` | integer | `10` | Items per page: `10`, `25`, or `50` |

**Success Response — 200**

```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 42,
        "ticketNumber": "TKT-2026-000042",
        "summary": "Laptop battery drains quickly",
        "category": { "id": 2, "name": "Hardware" },
        "relatedSystem": { "id": 3, "name": "Corporate Laptop" },
        "requestedPriority": "MEDIUM",
        "itPriority": "MEDIUM",
        "currentStatus": "NEW",
        "ticketOwner": null,
        "createdAt": "2026-08-22T07:54:00.000Z",
        "updatedAt": "2026-08-22T07:54:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 42,
      "totalPages": 5
    }
  }
}
```

**Error Cases:**

| Status | Code | Scenario |
|--------|------|----------|
| 400 | `MISSING_REQUESTER` | `requesterId` is missing |
| 400 | `INVALID_REQUESTER` | `requesterId` is not an active Requester |
| 400 | `INVALID_PAGE` | `page` is not a positive integer |
| 400 | `INVALID_PAGE_SIZE` | `pageSize` is not 10, 25, or 50 |
| 400 | `INVALID_SORT` | `sort` is not an allowed field |
| 400 | `INVALID_ORDER` | `order` is not `asc` or `desc` |
| 500 | `SERVER_ERROR` | Unexpected error |

---

### 4.3 GET `/api/tickets/:ticketNumber`

**Purpose:** Retrieve one Ticket by its Ticket Number, enforcing Requester ownership.

**Path Parameter:** `ticketNumber` — e.g. `TKT-2026-000042`

**Query Parameter:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requesterId` | integer | ✅ | ID of the currently selected Requester |

**Success Response — 200**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "ticketNumber": "TKT-2026-000042",
    "requester": { "id": 1, "name": "Jennifer Anderson" },
    "category": { "id": 2, "name": "Hardware" },
    "relatedSystem": { "id": 3, "name": "Corporate Laptop" },
    "summary": "Laptop battery drains quickly",
    "description": "My laptop battery is draining much faster...",
    "requestedPriority": "MEDIUM",
    "itPriority": "MEDIUM",
    "currentStatus": "NEW",
    "ticketOwner": null,
    "createdAt": "2026-08-22T07:54:00.000Z",
    "updatedAt": "2026-08-22T07:54:00.000Z",
    "attachments": [
      {
        "id": 7,
        "originalFilename": "screenshot.png",
        "mimeType": "image/png",
        "sizeBytes": 1258291,
        "createdAt": "2026-08-22T08:00:00.000Z",
        "removedAt": null,
        "removalReason": null
      }
    ]
  }
}
```

**Error Cases:**

| Status | Code | Scenario |
|--------|------|----------|
| 400 | `MISSING_REQUESTER` | `requesterId` query param missing |
| 403 | `FORBIDDEN` | Ticket exists but does not belong to the specified Requester |
| 404 | `NOT_FOUND` | No Ticket with the given `ticketNumber` |
| 500 | `SERVER_ERROR` | Unexpected error |

---

## 5. Attachment Endpoints

### 5.1 POST `/api/tickets/:ticketNumber/attachments`

**Purpose:** Upload an Attachment to an existing owned Ticket.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requesterId` | integer (form field) | ✅ | Currently selected Requester ID |
| `file` | file | ✅ | The attachment file |

**Constraints (enforced in backend):**

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Maximum file size: 5 MB (5,242,880 bytes)
- Maximum active attachments per Ticket: 5

**Success Response — 201**

```json
{
  "success": true,
  "data": {
    "id": 8,
    "ticketId": 42,
    "originalFilename": "report.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 819200,
    "createdAt": "2026-08-22T09:00:00.000Z",
    "removedAt": null
  }
}
```

**Error Cases:**

| Status | Code | Scenario |
|--------|------|----------|
| 400 | `MISSING_REQUESTER` | `requesterId` missing |
| 400 | `NO_FILE` | No file provided in the request |
| 403 | `FORBIDDEN` | Ticket does not belong to the specified Requester |
| 404 | `NOT_FOUND` | Ticket not found |
| 409 | `ATTACHMENT_LIMIT` | Ticket already has 5 active attachments |
| 413 | `FILE_TOO_LARGE` | File exceeds 5 MB |
| 415 | `UNSUPPORTED_TYPE` | File type not in allowed list |
| 500 | `SERVER_ERROR` | Unexpected error; ticket is preserved |

---

### 5.2 GET `/api/tickets/:ticketNumber/attachments`

**Purpose:** Retrieve attachment metadata for a Ticket (both active and removed).

**Query Parameter:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requesterId` | integer | ✅ | Currently selected Requester ID |

**Success Response — 200**

```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "originalFilename": "screenshot.png",
      "mimeType": "image/png",
      "sizeBytes": 1258291,
      "createdAt": "2026-08-22T08:00:00.000Z",
      "removedAt": null,
      "removedByRequesterId": null,
      "removalReason": null
    },
    {
      "id": 6,
      "originalFilename": "old-screenshot.png",
      "mimeType": "image/png",
      "sizeBytes": 980000,
      "createdAt": "2026-08-22T07:55:00.000Z",
      "removedAt": "2026-08-22T09:30:00.000Z",
      "removedByRequesterId": 1,
      "removalReason": "Duplicate file uploaded by mistake."
    }
  ]
}
```

**Error Cases:**

| Status | Code | Scenario |
|--------|------|----------|
| 400 | `MISSING_REQUESTER` | `requesterId` missing |
| 403 | `FORBIDDEN` | Ticket does not belong to the Requester |
| 404 | `NOT_FOUND` | Ticket not found |
| 500 | `SERVER_ERROR` | Unexpected error |

---

### 5.3 GET `/api/attachments/:id/download`

**Purpose:** Download an active (non-removed) Attachment file.

**Query Parameter:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requesterId` | integer | ✅ | Currently selected Requester ID |

**Success Response — 200**

- Content-Type: the file's MIME type (e.g. `image/png`, `application/pdf`).
- `Content-Disposition: attachment; filename="original-filename.png"`.
- Response body: raw file bytes.

**Error Cases:**

| Status | Code | Scenario |
|--------|------|----------|
| 400 | `MISSING_REQUESTER` | `requesterId` missing |
| 403 | `FORBIDDEN` | Attachment belongs to a different Requester's Ticket |
| 403 | `REMOVED` | Attachment has been soft-removed (`removedAt` is not null) |
| 404 | `NOT_FOUND` | Attachment ID does not exist |
| 500 | `SERVER_ERROR` | Unexpected error |

---

### 5.4 DELETE `/api/attachments/:id`

**Purpose:** Soft-remove an Attachment. The record is not deleted; `removedAt`, `removedByRequesterId`, and `removalReason` are set.

**Request Body:**

```json
{
  "requesterId": 1,
  "removalReason": "Duplicate file uploaded by mistake."
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| `requesterId` | Required; must be an active Requester |
| `removalReason` | Required; trimmed length ≥ 5 characters |

**Success Response — 200**

```json
{
  "success": true,
  "data": {
    "id": 7,
    "removedAt": "2026-08-22T09:30:00.000Z",
    "removedByRequesterId": 1,
    "removalReason": "Duplicate file uploaded by mistake."
  }
}
```

**Error Cases:**

| Status | Code | Scenario |
|--------|------|----------|
| 400 | `VALIDATION_ERROR` | `requesterId` or `removalReason` missing or invalid |
| 403 | `FORBIDDEN` | Attachment belongs to a different Requester's Ticket |
| 404 | `NOT_FOUND` | Attachment ID does not exist |
| 409 | `ALREADY_REMOVED` | Attachment has already been soft-removed |
| 500 | `SERVER_ERROR` | Unexpected error |

---

## 6. Ticket-List Query Contract

Full query example:

```
GET /api/tickets?requesterId=1&search=laptop&category=Hardware&requestedPriority=MEDIUM&status=NEW&sort=createdAt&order=desc&page=1&pageSize=10
```

### 6.1 Sort Field Mapping

| `sort` Value | Database Column |
|--------------|----------------|
| `ticketNumber` | `Ticket.ticketNumber` |
| `createdAt` | `Ticket.createdAt` |
| `updatedAt` | `Ticket.updatedAt` |

### 6.2 Search Behavior

- `search` is matched against `Ticket.summary` AND `Ticket.ticketNumber` using a case-insensitive `ILIKE %search%` (PostgreSQL) or Prisma `contains` with `mode: 'insensitive'`.
- Multiple search terms are NOT supported in Lab 2; the entire `search` value is treated as a single substring.

### 6.3 Filter Behavior

- Multiple filters are combined with AND logic.
- Filters with value `""` or omitted are ignored (no filter applied for that field).

### 6.4 Pagination Behavior

- `page` must be a positive integer ≥ 1.
- `pageSize` must be 10, 25, or 50. Any other value returns 400.
- If `page` exceeds `totalPages`, an empty `tickets` array is returned with accurate `pagination` metadata (not an error).

---

## 7. Ownership Enforcement

All endpoints that access a specific Ticket or Attachment perform an ownership check:

1. Look up the resource by its ID or ticket number.
2. Verify that `ticket.requesterId === requesterId` (from query param or body).
3. If the check fails → return **403 FORBIDDEN** with a safe error message.
4. Never return 404 for an existing resource that fails the ownership check (to avoid leaking existence information about other Requesters' tickets).

> **Exception:** If the Ticket genuinely does not exist, return 404.

---

## 8. API Internal Consistency Notes

- All timestamps are stored and returned in **UTC ISO 8601** format.
- `requesterId` in the request (query param or body) is the client-provided identity. In Lab 2 it is trusted without authentication. Lab 3 will replace this with a server-verified JWT claim.
- The `ticketNumber` path parameter is used instead of the internal `id` in public URLs to avoid exposing sequential internal IDs.
- Attachment `id` (integer) is used in attachment endpoints for simplicity; Lab 3 may migrate to UUID if needed.
