import { NavLink, useNavigate } from "react-router-dom";
import { useRequester } from "../contexts/RequesterContext";

export default function NavBar() {
  const { requester, clearRequester } = useRequester();
  const navigate = useNavigate();

  function handleChangeRequester() {
    clearRequester();
    navigate("/select-requester");
  }

  return (
    <nav className="flex items-center justify-between px-6 h-14 shadow-sm"
         style={{ backgroundColor: "#006B3C" }}>

      {/* Brand */}
      <span className="text-white font-bold text-lg tracking-wide">
        🎫 TokTickIT
      </span>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        <NavLink
          to="/my-tickets"
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive
                ? "text-white underline underline-offset-4"
                : "text-green-100 hover:text-white"
            }`
          }
        >
          My Tickets
        </NavLink>

        <NavLink
          to="/create-ticket"
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive
                ? "text-white underline underline-offset-4"
                : "text-green-100 hover:text-white"
            }`
          }
        >
          Create Ticket
        </NavLink>
      </div>

      {/* Profile / Requester area */}
      <div className="flex items-center gap-3">
        {requester ? (
          <>
            <span className="text-green-100 text-sm">
              👤 {requester.name}
            </span>
            <button
              onClick={handleChangeRequester}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md transition-colors"
            >
              Change Requester
            </button>
          </>
        ) : (
          <span className="text-green-200 text-sm italic">No requester selected</span>
        )}
      </div>
    </nav>
  );
}

