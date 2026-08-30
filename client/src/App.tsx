import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequesterProvider, useRequester } from "./contexts/RequesterContext";
import NavBar from "./components/NavBar";
import RequesterSelectionPage from "./pages/RequesterSelectionPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";

// ─── Guard: redirect to /select-requester if no requester selected (FR-14) ───

function GuardedRoute({ children }: { children: React.ReactNode }) {
  const { requester } = useRequester();
  if (!requester) return <Navigate to="/select-requester" replace />;
  return <>{children}</>;
}

// ─── App shell layout ─────────────────────────────────────────────────────────

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F7F6" }}>
      <NavBar />
      <main className="flex-1">
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/my-tickets" replace />} />

          {/* Requester selection — no guard needed */}
          <Route path="/select-requester" element={<RequesterSelectionPage />} />

          {/* Guarded routes */}
          <Route path="/my-tickets" element={
            <GuardedRoute>
              <MyTicketsPage />
            </GuardedRoute>
          } />
          <Route path="/create-ticket" element={
            <GuardedRoute>
              <CreateTicketPage />
            </GuardedRoute>
          } />
          <Route path="/tickets/:ticketNumber" element={
            <GuardedRoute>
              <TicketDetailPage />
            </GuardedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <RequesterProvider>
        <AppShell />
      </RequesterProvider>
    </BrowserRouter>
  );
}
