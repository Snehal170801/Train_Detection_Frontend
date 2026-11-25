// client/src/layouts/EmployeePortalLayout.jsx
import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import ConfirmModal from "../components/common/ConfirmModal";

const ACCENT = "#C8102E";

const NAV_ITEMS = [
  { path: "/portal", label: "My Assets" },
  { path: "/portal/tickets", label: "My Tickets" },
  { path: "/portal/password", label: "Update Password" },
];

const EmployeePortalLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#F1F5F9" }}>
      {/* Top bar */}
      <div style={{
        background: `linear-gradient(135deg,${ACCENT},#8B0015)`,
        padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>
            Asset Management System
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>
            {user?.fullName || user?.email}
            {user?.emp_id && (
              <span style={{ fontFamily: "monospace" }}> · Emp ID {user.emp_id}</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setLogoutConfirmOpen(true)}
          style={{
            background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
            fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Nav */}
      <div style={{
        display: "flex", gap: 4, padding: "10px 16px", background: "#fff",
        borderBottom: "1px solid #E2E8F0", flexShrink: 0,
      }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                textDecoration: "none",
                color: active ? ACCENT : "#64748B",
                background: active ? "#FFF0F2" : "transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Content — its own scroll container */}
      <div style={{ flex: "1 1 auto", overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "16px" }}>
        <Outlet />
      </div>

      <ConfirmModal
        open={logoutConfirmOpen}
        title="Log Out?"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Logout"
        confirmColor="red"
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          handleLogout();
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
};

export default EmployeePortalLayout;
