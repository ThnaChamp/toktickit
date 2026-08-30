import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRequesters, type Requester } from "../services/api";
import { useRequester } from "../contexts/RequesterContext";

type LoadState = "loading" | "success" | "error" | "empty";

export default function RequesterSelectionPage() {
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const { selectRequester } = useRequester();
  const navigate = useNavigate();

  async function load() {
    setLoadState("loading");
    try {
      const data = await fetchRequesters();
      setRequesters(data);
      setLoadState(data.length === 0 ? "empty" : "success");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => { load(); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = requesters.find((r) => r.id === Number(selectedId));
    if (!found) return;
    selectRequester(found);
    navigate("/my-tickets");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ backgroundColor: "#F5F7F6" }}>

      <div className="bg-white rounded-xl shadow-md w-full max-w-md p-8">

        {/* Title */}
        <h1 className="text-xl font-bold mb-1" style={{ color: "#1A2E22" }}>
          Development Requester Selection
        </h1>
        <p className="text-sm mb-6" style={{ color: "#4A6355" }}>
          Choose a development requester to simulate the current requester context for Lab 2.
        </p>

        {/* Warning callout — testing only (BR-03) */}
        <div className="flex gap-2 items-start rounded-lg px-4 py-3 mb-4 text-sm"
             style={{ backgroundColor: "#FFFBEB", color: "#92400E" }}>
          <span>⚠️</span>
          <span>
            <strong>This is for testing only</strong> and is not a login screen.
            The selected identity is not authenticated.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Loading state */}
          {loadState === "loading" && (
            <div className="text-sm text-center py-4" style={{ color: "#4A6355" }}>
              Loading requesters…
            </div>
          )}

          {/* Error state */}
          {loadState === "error" && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}>
              <p className="font-medium">Unable to load requesters.</p>
              <button type="button" onClick={load}
                      className="underline mt-1 cursor-pointer">
                Retry
              </button>
            </div>
          )}

          {/* Empty state — no active requesters */}
          {loadState === "empty" && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "#F0F4F1", color: "#4A6355" }}>
              No active requesters available. Please contact an administrator.
            </div>
          )}

          {/* Dropdown */}
          {loadState === "success" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "#1A2E22" }}>
                Development Requester <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                required
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3C]"
                style={{
                  borderColor: "#D1E0D8",
                  color: "#1A2E22",
                }}
              >
                <option value="">— Select a requester —</option>
                {requesters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <p className="text-xs mt-1" style={{ color: "#4A6355" }}>
                ℹ️ Only active development requesters are shown.
              </p>
            </div>
          )}

          {/* Submit */}
          {loadState === "success" && (
            <button
              type="submit"
              disabled={!selectedId}
              className="w-full py-2 rounded-md text-sm font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#006B3C" }}
            >
              Select Requester
            </button>
          )}
        </form>

        {/* Lab 3 info callout */}
        <div className="flex gap-2 items-start rounded-lg px-4 py-3 mt-5 text-sm"
             style={{ backgroundColor: "#EAF6EF", color: "#065F46" }}>
          <span>🔒</span>
          <span>
            <strong>Authentication coming in Lab 3.</strong><br />
            This selection will be replaced with secure authentication so you can access
            the system with your own account.
          </span>
        </div>

      </div>
    </div>
  );
}

