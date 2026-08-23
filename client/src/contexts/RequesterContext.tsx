import { createContext, useContext, useState, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Requester {
  id: number;
  name: string;
  email: string;
}

interface RequesterContextValue {
  requester: Requester | null;
  selectRequester: (r: Requester) => void;
  clearRequester: () => void;
}

// ─── sessionStorage keys ─────────────────────────────────────────────────────

const SESSION_KEY = "selectedRequester";

function loadFromSession(): Requester | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Requester) : null;
  } catch {
    return null;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const RequesterContext = createContext<RequesterContextValue | null>(null);

export function RequesterProvider({ children }: { children: ReactNode }) {
  const [requester, setRequester] = useState<Requester | null>(loadFromSession);

  function selectRequester(r: Requester) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(r));
    setRequester(r);
  }

  function clearRequester() {
    sessionStorage.removeItem(SESSION_KEY);
    setRequester(null);
  }

  return (
    <RequesterContext.Provider value={{ requester, selectRequester, clearRequester }}>
      {children}
    </RequesterContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRequester() {
  const ctx = useContext(RequesterContext);
  if (!ctx) throw new Error("useRequester must be used inside RequesterProvider");
  return ctx;
}

