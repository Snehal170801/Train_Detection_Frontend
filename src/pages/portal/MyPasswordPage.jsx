// client/src/pages/portal/MyPasswordPage.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { changeMyPasswordApi } from "../../api/userApi";
import ConfirmModal from "../../components/common/ConfirmModal";

const inputStyle = {
  width: "100%",
  padding: "10px 40px 10px 12px",
  border: "1px solid #E2E8F0",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#1E293B",
  outline: "none",
  boxSizing: "border-box",
};

const eyeButtonStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  padding: "4px",
  cursor: "pointer",
  color: "#94A3B8",
  display: "flex",
  alignItems: "center",
};

const PasswordInput = ({ value, onChange, required, minLength }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        style={inputStyle}
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        style={eyeButtonStyle}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

const label = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#475569",
  marginBottom: "6px",
  display: "block",
};

const MyPasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleValidateAndConfirm = (e) => {
    e.preventDefault();
    setServerError("");

    if (newPassword.length < 6) {
      setServerError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setServerError("New password and confirm password do not match");
      return;
    }
    if (newPassword === currentPassword) {
      setServerError("New password must be different from current password");
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmedSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      await changeMyPasswordApi({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "380px",
        margin: "0 auto",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        padding: "24px 22px",
      }}
    >
      <h2
        style={{ fontSize: "17px", fontWeight: 700, color: "#1E293B", margin: "0 0 6px" }}
      >
        Update Password
      </h2>
      <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 20px" }}>
        Change your account password below.
      </p>

      <form onSubmit={handleValidateAndConfirm}>
        <div style={{ marginBottom: "14px" }}>
          <label style={label}>Current Password</label>
          <PasswordInput
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: "14px" }}>
          <label style={label}>New Password</label>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div style={{ marginBottom: "18px" }}>
          <label style={label}>Confirm New Password</label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      <ConfirmModal
        open={confirmOpen}
        title="Update Your Password?"
        message="You'll need to use this new password the next time you log in."
        confirmLabel="Yes, Update"
        confirmColor="red"
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setConfirmOpen(false)}
        loading={loading}
      />
    </div>
  );
};

export default MyPasswordPage;
