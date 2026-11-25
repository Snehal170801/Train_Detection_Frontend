// client/src/pages/auth/ForcePasswordChangePage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { completeFirstLoginApi } from "../../api/authApi";
import useAuthStore from "../../store/authStore";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #E2E8F0",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#1E293B",
  outline: "none",
  boxSizing: "border-box",
};

const label = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#475569",
  marginBottom: "6px",
  display: "block",
};

const ForcePasswordChangePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [email] = useState(location.state?.email || "");
  const [currentPassword, setCurrentPassword] = useState(
    location.state?.tempPassword || "",
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!email) navigate("/login", { replace: true });
  }, [email, navigate]);

  if (!email) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (newPassword.length < 6) {
      setServerError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setServerError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await completeFirstLoginApi({
      email,
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setLoading(false);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    await login(result.data.token, result.data.user);
    toast.success("Password set successfully. Welcome!");
    navigate(
      result.data.user.role === "Employee" ? "/portal" : "/dashboard",
      { replace: true },
    );
  };

  return (
    <div
      style={{
        height: "100dvh",
        width: "100%",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8F8F8",
        padding: "24px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          padding: "28px 26px",
        }}
      >
        <img
          src="/DaccessLogo.png"
          alt="Daccess"
          style={{ height: "28px", marginBottom: "18px" }}
        />
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#1E293B",
            margin: "0 0 6px",
          }}
        >
          Set Your Password
        </h2>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 20px" }}>
          This is your first login. Please set a new password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label style={label}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              required
              minLength={6}
            />
          </div>
          <div style={{ marginBottom: "18px" }}>
            <label style={label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              required
              minLength={6}
            />
          </div>

          {serverError && (
            <p style={{ fontSize: "12px", color: "#DC2626", marginBottom: "14px" }}>
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "8px",
              border: "none",
              background: "#C8102E",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Setting password..." : "Set Password & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForcePasswordChangePage;
