export const mockRequesters = [
  { id: 1, name: "Jennifer Anderson", email: "jennifer@example.com", isActive: true },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", isActive: true },
  { id: 3, name: "David Lee", email: "david@example.com", isActive: true },
  { id: 4, name: "Michael Brown", email: "michael@example.com", isActive: true },
];

export const mockCategories = [
  { id: 1, name: "Hardware", isActive: true },
  { id: 2, name: "Software", isActive: true },
  { id: 3, name: "Network", isActive: true },
  { id: 4, name: "Account and Access", isActive: true },
];

export const mockRelatedSystems = [
  { id: 1, name: "Corporate Laptop", isActive: true },
  { id: 2, name: "Email", isActive: true },
  { id: 3, name: "Campus Wi-Fi", isActive: true },
  { id: 4, name: "VPN", isActive: true },
  { id: 5, name: "LEB2 App", isActive: true },
  { id: 6, name: "Printer", isActive: true },
];

export const mockTicketsRequester1 = [
  {
    id: 1,
    ticketNumber: "TKT-2026-000001",
    requesterId: 1,
    categoryId: 1,
    relatedSystemId: 1,
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    currentStatus: "IN_PROGRESS",
    summary: "Laptop battery drains quickly",
    description: "My laptop battery is draining much faster than usual even when idle.",
    createdAt: "2026-05-12T09:14:00.000Z",
    updatedAt: "2026-05-13T10:30:00.000Z",
    category: { id: 1, name: "Hardware" },
    relatedSystem: { id: 1, name: "Corporate Laptop" },
    requester: { id: 1, name: "Jennifer Anderson", email: "jennifer@example.com" },
    ticketOwner: { id: 4, name: "Michael Brown", email: "michael@example.com" },
    attachments: [
      {
        id: 101,
        ticketId: 1,
        uploaderId: 1,
        originalFilename: "battery-stats.png",
        storedFilename: "attachment-101.png",
        mimeType: "image/png",
        sizeBytes: 45200,
        storagePath: "uploads/attachment-101.png",
        removedAt: null,
        removedByRequesterId: null,
        removalReason: null,
        createdAt: "2026-05-12T09:15:00.000Z",
        uploader: { id: 1, name: "Jennifer Anderson" },
      },
    ],
  },
  {
    id: 2,
    ticketNumber: "TKT-2026-000002",
    requesterId: 1,
    categoryId: 3,
    relatedSystemId: 4,
    requestedPriority: "HIGH",
    itPriority: "HIGH",
    currentStatus: "OPEN",
    summary: "Cannot connect to VPN from home",
    description: "Whenever I connect to the corporate VPN from home, it immediately disconnects.",
    createdAt: "2026-05-12T08:02:00.000Z",
    updatedAt: "2026-05-13T09:45:00.000Z",
    category: { id: 3, name: "Network" },
    relatedSystem: { id: 4, name: "VPN" },
    requester: { id: 1, name: "Jennifer Anderson", email: "jennifer@example.com" },
    ticketOwner: null,
    attachments: [],
  },
];

export const mockTicketsRequester2 = [
  {
    id: 3,
    ticketNumber: "TKT-2026-000003",
    requesterId: 2,
    categoryId: 2,
    relatedSystemId: 2,
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    currentStatus: "IN_PROGRESS",
    summary: "Email not syncing on mobile",
    description: "Emails stopped updating on iPhone Outlook client.",
    createdAt: "2026-05-11T16:45:00.000Z",
    updatedAt: "2026-05-12T15:20:00.000Z",
    category: { id: 2, name: "Software" },
    relatedSystem: { id: 2, name: "Email" },
    requester: { id: 2, name: "Sarah Johnson", email: "sarah@example.com" },
    ticketOwner: null,
    attachments: [],
  },
];

