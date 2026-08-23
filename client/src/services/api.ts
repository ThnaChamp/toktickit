const BASE_URL = "http://localhost:3000";

export interface Requester {
  id: number;
  name: string;
  email: string;
}

export async function fetchRequesters(): Promise<Requester[]> {
  const res = await fetch(`${BASE_URL}/api/requesters`);
  if (!res.ok) throw new Error("Failed to fetch requesters");
  const json = await res.json();
  return json.data as Requester[];
}
