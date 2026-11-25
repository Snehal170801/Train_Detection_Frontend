// client/src/pages/portal/MyAssetsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyAssetsApi, raiseTicketApi } from "../../api/ticketApi";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/common/ConfirmModal";

const TICKET_STATUS_STYLES = {
  Open:       { bg: "#DBEAFE", color: "#1D4ED8" },
  InProgress: { bg: "#FEF9C3", color: "#A16207" },
};

const ACCENT = "#C8102E";

const CATEGORIES = ["Hardware Fault", "Software Issue", "Physical Damage", "Lost/Stolen", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];

const RaiseTicketForm = ({ asset, onClose, onRaised }) => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleValidateAndConfirm = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmedSubmit = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    const res = await raiseTicketApi({
      assetId: asset.id,
      category,
      priority,
      description: description.trim(),
    });
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(`Ticket ${res.data.ticket_code} raised and sent to the admin team.`);
    onRaised();
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 12, width: "100%", maxWidth: 420,
        maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1E293B" }}>Report an Issue</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>
            {asset.asset_name} · {asset.asset_code}
          </p>
        </div>
        <form onSubmit={handleValidateAndConfirm} style={{ padding: 20, overflowY: "auto", flex: "1 1 auto", minHeight: 0 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, marginBottom: 14 }}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
            Priority
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {PRIORITIES.map((p) => (
              <button
                key={p} type="button" onClick={() => setPriority(p)}
                style={{
                  flex: 1, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `2px solid ${priority === p ? ACCENT : "#E2E8F0"}`,
                  background: priority === p ? "#FFF0F2" : "#fff",
                  color: priority === p ? ACCENT : "#94A3B8",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
            Describe the issue *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What's wrong with this asset?"
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
          />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <button type="button" onClick={onClose} style={{
              padding: "9px 18px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff",
              color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{
              padding: "9px 18px", borderRadius: 8, border: "none", background: ACCENT,
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? "Raising..." : "Raise Ticket"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Raise This Ticket?"
        message="This will submit your issue to the admin team for review. You can still edit or delete it later, as long as it hasn't been picked up yet."
        subText={`${asset.asset_name} · ${asset.asset_code}`}
        confirmLabel="Yes, Submit"
        confirmColor="red"
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setConfirmOpen(false)}
        loading={submitting}
      />
    </div>
  );
};

const MyAssetsPage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketAsset, setTicketAsset] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await getMyAssetsApi();
    if (res.success) setAssets(res.data?.assets || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <p style={{ fontSize: 13, color: "#94A3B8" }}>Loading your assets...</p>;

  if (assets.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8" }}>
        <p style={{ fontSize: 14 }}>No assets are currently assigned to you.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", margin: "4px 0 14px" }}>My Assets</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {assets.map((a) => {
          const ticketStyle = TICKET_STATUS_STYLES[a.openTicketStatus];
          return (
            <div key={a.id} style={{
              background: "#fff", borderRadius: 12, padding: "14px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex",
              justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E293B" }}>{a.asset_name}</p>
                  {ticketStyle && (
                    <span style={{
                      background: ticketStyle.bg, color: ticketStyle.color, fontSize: 10, fontWeight: 700,
                      padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap",
                    }}>
                      Issue {a.openTicketStatus === "InProgress" ? "In Progress" : "Reported"}
                    </span>
                  )}
                </div>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>{a.asset_code}</p>
              </div>
              {ticketStyle ? (
                <button
                  onClick={() => navigate("/portal/tickets")}
                  style={{
                    padding: "8px 16px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff",
                    color: "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  View Ticket
                </button>
              ) : (
                <button
                  onClick={() => setTicketAsset(a)}
                  style={{
                    padding: "8px 16px", borderRadius: 8, border: "none", background: ACCENT,
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  Report an Issue
                </button>
              )}
            </div>
          );
        })}
      </div>

      {ticketAsset && (
        <RaiseTicketForm asset={ticketAsset} onClose={() => setTicketAsset(null)} onRaised={load} />
      )}
    </div>
  );
};

export default MyAssetsPage;
