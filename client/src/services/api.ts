const BASE_URL = "http://localhost:3000";

export interface Requester {
  id: number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface RelatedSystem {
  id: number;
  name: string;
}

export interface CreateTicketInput {
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH";
  summary: string;
  description: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  requestedPriority: string;
  itPriority: string;
  currentStatus: string;
  summary: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string };
  relatedSystem?: { id: number; name: string };
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface GetTicketsResponse {
  tickets: Ticket[];
  pagination: Pagination;
}

export interface GetTicketsParams {
  requesterId: number;
  search?: string;
  category?: string;
  requestedPriority?: string;
  itPriority?: string;
  status?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────
// 1. ดึงรายชื่อ Requester (มีอยู่แล้ว)
export async function fetchRequesters(): Promise<Requester[]> {
  const res = await fetch(`${BASE_URL}/api/requesters`);
  if (!res.ok) throw new Error("Failed to fetch requesters");
  const json = await res.json();
  return json.data as Requester[];
}

// 2. ดึง Categories สำหรับใส่ใน Dropdown
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const json = await res.json();
  return json.data as Category[];
}

// 3. ดึง Related Systems สำหรับใส่ใน Dropdown
export async function fetchRelatedSystems(): Promise<RelatedSystem[]> {
  const res = await fetch(`${BASE_URL}/api/related-systems`);
  if (!res.ok) throw new Error("Failed to fetch related systems");
  const json = await res.json();
  return json.data as RelatedSystem[];
}

// 4. ส่งข้อมูลสร้าง Ticket ใหม่
export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const res = await fetch(`${BASE_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.error?.message || "Failed to create ticket";
    throw new Error(errorMsg);
  }
  return json.data as Ticket;
}

// 5. ดึงรายการตั๋ว My Tickets (พร้อม Search, Filter, Sort, Pagination)
export async function fetchTickets(params: GetTicketsParams): Promise<GetTicketsResponse> {
  const query = new URLSearchParams();
  query.append("requesterId", String(params.requesterId));

  if (params.search && params.search.trim() !== "") {
    query.append("search", params.search.trim());
  }
  if (params.category && params.category !== "") {
    query.append("category", params.category);
  }
  if (params.requestedPriority && params.requestedPriority !== "") {
    query.append("requestedPriority", params.requestedPriority);
  }
  if (params.itPriority && params.itPriority !== "") {
    query.append("itPriority", params.itPriority);
  }
  if (params.status && params.status !== "") {
    query.append("status", params.status);
  }
  if (params.sort) {
    query.append("sort", params.sort);
  }
  if (params.order) {
    query.append("order", params.order);
  }
  if (params.page) {
    query.append("page", String(params.page));
  }
  if (params.pageSize) {
    query.append("pageSize", String(params.pageSize));
  }

  const res = await fetch(`${BASE_URL}/api/tickets?${query.toString()}`);
  const json = await res.json();

  if (!res.ok) {
    const errorMsg = json.error?.message || "Failed to fetch tickets";
    throw new Error(errorMsg);
  }

  return json.data as GetTicketsResponse;
}