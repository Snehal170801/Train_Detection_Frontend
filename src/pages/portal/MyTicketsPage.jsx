// client/src/pages/portal/MyTicketsPage.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getTicketsApi,
  reopenTicketApi,
  cancelReopenApi,
  updateTicketApi,
  withdrawTicketApi,
  submitToAdminApi,
  confirmPickupApi,
} from "../../api/ticketApi";
import ConfirmModal from "../../components/common/ConfirmModal";

const ACCENT = "#C8102E";

const STATUS_STYLES = {
  Open:                     { bg: "#DBEAFE", color: "#1D4ED8" },
  "Waiting for Received":   { bg: "#FEF9C3", color: "#A16207" },
  "Awaiting Confirmation":  { bg: "#FEF9C3", color: "#A16207" },
  "Not Received":           { bg: "#FEE2E2", color: "#DC2626" },
  "In Repair":              { bg: "#FEF9C3", color: "#A16207" },
  "Ready for Pickup":       { bg: "#DCFCE7", color: "#15803D" },
  InProgress:               { bg: "#FEF9C3", color: "#A16207" },
  Resolved:                 { bg: "#DCFCE7", color: "#15803D" },
  Rejected:                 { bg: "#FEE2E2", color: "#DC2626" },
};

// InProgress on its own doesn't tell the employee what's actually happening —
// show what stage of the custody handover it's in.
const ticketStatusLabel = (ticket) => {
  if (ticket.status !== "InProgress") return ticket.status;
  switch (ticket.custody_status) {
    case "AwaitingCollection": return "Waiting for Received";
    case "Submitted":          return "Awaiting Confirmation";
    case "NotReceived":        return "Not Received";
    case "WithAdmin":          return "In Repair";
    case "ReadyForPickup":     return "Ready for Pickup";
    default:                   return "InProgress";
  }
};

const CATEGORIES = ["Hardware Fault", "Software Issue", "Physical Damage", "Lost/Stolen", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null;

const EditTicketForm = ({ ticket, onClose, onSaved }) => {
  const [category, setCategory] = useState(ticket.category || CATEGORIES[0]);
  const [priority, setPriority] = useState(ticket.priority || "Medium");
  const [description, setDescription] = useState(ticket.description || "");
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

  const handleConfirmedSave = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    const res = await updateTicketApi(ticket.id, { category, priority, description: description.trim() });
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Ticket updated");
    onSaved();
    onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 420, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1E293B" }}>Edit Ticket</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>{ticket.ticket_code}</p>
        </div>
        <form onSubmit={handleValidateAndConfirm} style={{ padding: 20, overflowY: "auto", flex: "1 1 auto", minHeight: 0 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, marginBottom: 14 }}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Priority</label>
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

          <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Describe the issue *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
          />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: ACCENT, color: "#fff", fontSize: 13, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Save Changes?"
        message="This will update the ticket you raised."
        subText={ticket.ticket_code}
        confirmLabel="Yes, Save"
        confirmColor="blue"
        onConfirm={handleConfirmedSave}
        onCancel={() => setConfirmOpen(false)}
        loading={submitting}
      />
    </div>
  );
};

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTicket, setEditTicket] = useState(null);
  const [withdrawTicket, setWithdrawTicket] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [reopenTicketTarget, setReopenTicketTarget] = useState(null);
  const [reopening, setReopening] = useState(false);
  const [cancelReopenTarget, setCancelReopenTarget] = useState(null);
  const [cancellingReopen, setCancellingReopen] = useState(false);
  const [submitTarget, setSubmitTarget] = useState(null);
  const [submitting2, setSubmitting2] = useState(false);
  const [pickupTarget, setPickupTarget] = useState(null);
  const [confirmingPickup, setConfirmingPickup] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getTicketsApi();
    if (res.success) setTickets(res.data?.tickets || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReopenConfirmed = async () => {
    setReopening(true);
    const res = await reopenTicketApi(reopenTicketTarget.id);
    setReopening(false);
    setReopenTicketTarget(null);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Ticket reopened");
    load();
  };

  const handleCancelReopenConfirmed = async () => {
    setCancellingReopen(true);
    const res = await cancelReopenApi(cancelReopenTarget.id);
    setCancellingReopen(false);
    setCancelReopenTarget(null);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Reopen cancelled");
    load();
  };

  const handleSubmitConfirmed = async () => {
    setSubmitting2(true);
    const res = await submitToAdminApi(submitTarget.id);
    setSubmitting2(false);
    setSubmitTarget(null);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Asset marked as submitted — awaiting admin confirmation");
    load();
  };

  const handlePickupConfirmed = async () => {
    setConfirmingPickup(true);
    const res = await confirmPickupApi(pickupTarget.id);
    setConfirmingPickup(false);
    setPickupTarget(null);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Pickup confirmed — ticket resolved");
    load();
  };

  const handleWithdrawConfirmed = async () => {
    setWithdrawing(true);
    const res = await withdrawTicketApi(withdrawTicket.id);
    setWithdrawing(false);
    setWithdrawTicket(null);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Ticket deleted");
    load();
  };

  if (loading) return <p style={{ fontSize: 13, color: "#94A3B8" }}>Loading your tickets...</p>;

  if (tickets.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8" }}>
        <p style={{ fontSize: 14 }}>You haven't raised any tickets yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", margin: "4px 0 14px" }}>My Tickets</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {tickets.map((t) => {
          const statusLabel = ticketStatusLabel(t);
          const s = STATUS_STYLES[statusLabel] || { bg: "#F1F5F9", color: "#64748B" };
          const isReopened = t.status === "Open" && !!t.previous_status;
          const canEdit = t.status === "Open";
          const canWithdraw = t.status === "Open" && !isReopened;
          return (
            <div key={t.id} style={{
              background: "#fff", borderRadius: 12, padding: "14px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
                    {t.asset_name} <span style={{ color: "#94A3B8", fontWeight: 500 }}>· {t.ticket_code}</span>
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8" }}>
                    {t.category || "General"} · Raised {fmt(t.created_at)}
                  </p>
                </div>
                <span style={{
                  background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
                }}>
                  {statusLabel}
                </span>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 13, color: "#475569" }}>{t.description}</p>

              {t.custody_status === "Submitted" && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "#FEF9C3", borderRadius: 8, fontSize: 12, color: "#A16207", fontWeight: 600 }}>
                  Submitted — waiting for admin to confirm receipt.
                </div>
              )}
              {t.custody_status === "WithAdmin" && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "#FEF9C3", borderRadius: 8, fontSize: 12, color: "#A16207", fontWeight: 600 }}>
                  Admin has received your asset — repair in progress.
                </div>
              )}
              {t.custody_status === "NotReceived" && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "#FEE2E2", borderRadius: 8, fontSize: 12, color: "#DC2626", fontWeight: 700 }}>
                  Admin says: Not Received. Please resubmit your asset.
                </div>
              )}
              {t.custody_status === "ReadyForPickup" && (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "#DCFCE7", borderRadius: 8, fontSize: 12.5, color: "#15803D", fontWeight: 700 }}>
                  ✓ Issue is Solved. Collect Your Assets from admin, then confirm below.
                </div>
              )}
              {isReopened && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "#DBEAFE", borderRadius: 8, fontSize: 12, color: "#1D4ED8", fontWeight: 600 }}>
                  Reopened — waiting for admin to look at it again.
                </div>
              )}

              {t.resolution_notes && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "#F8FAFC", borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                    Response
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#475569" }}>{t.resolution_notes}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {canEdit && (
                  <button
                    onClick={() => setEditTicket(t)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Edit
                  </button>
                )}
                {canWithdraw && (
                  <button
                    onClick={() => setWithdrawTicket(t)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #FEE2E2", background: "#fff", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Delete
                  </button>
                )}
                {isReopened && (
                  <button
                    onClick={() => setCancelReopenTarget(t)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Cancel Reopen
                  </button>
                )}
                {(t.status === "Resolved" || t.status === "Rejected") && (
                  <button
                    onClick={() => setReopenTicketTarget(t)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Issue still persists — Reopen
                  </button>
                )}
                {!canEdit && t.status === "InProgress" && (
                  <span style={{ fontSize: 11, color: "#94A3B8", alignSelf: "center" }}>
                    Already acknowledged — can no longer edit or delete
                  </span>
                )}
                {t.status === "InProgress" && (t.custody_status === "AwaitingCollection" || t.custody_status === "NotReceived") && (
                  <button
                    onClick={() => setSubmitTarget(t)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: ACCENT, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    {t.custody_status === "NotReceived" ? "Resubmit my asset to admin" : "I've submitted my asset to admin"}
                  </button>
                )}
                {t.custody_status === "ReadyForPickup" && (
                  <button
                    onClick={() => setPickupTarget(t)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#16A34A", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Issue is Solved. Collect Your Assets
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editTicket && (
        <EditTicketForm ticket={editTicket} onClose={() => setEditTicket(null)} onSaved={load} />
      )}

      <ConfirmModal
        open={!!withdrawTicket}
        title="Delete This Ticket?"
        message="This will permanently remove the ticket you raised. This cannot be undone."
        subText={withdrawTicket?.ticket_code}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={handleWithdrawConfirmed}
        onCancel={() => setWithdrawTicket(null)}
        loading={withdrawing}
      />

      <ConfirmModal
        open={!!reopenTicketTarget}
        title="Reopen This Ticket?"
        message="This sends it back to the admin team for another look."
        subText={reopenTicketTarget?.ticket_code}
        confirmLabel="Yes, Reopen"
        confirmColor="blue"
        onConfirm={handleReopenConfirmed}
        onCancel={() => setReopenTicketTarget(null)}
        loading={reopening}
      />

      <ConfirmModal
        open={!!cancelReopenTarget}
        title="Cancel This Reopen?"
        message="This reverts the ticket back to how it was before you reopened it."
        subText={cancelReopenTarget?.ticket_code}
        confirmLabel="Yes, Cancel Reopen"
        confirmColor="blue"
        onConfirm={handleCancelReopenConfirmed}
        onCancel={() => setCancelReopenTarget(null)}
        loading={cancellingReopen}
      />

      <ConfirmModal
        open={!!submitTarget}
        title="Submitted Your Asset to Admin?"
        message="Confirm you've physically handed the asset over to the admin team. They'll confirm receipt before proceeding."
        subText={submitTarget?.ticket_code}
        confirmLabel="Yes, I've Submitted It"
        confirmColor="blue"
        onConfirm={handleSubmitConfirmed}
        onCancel={() => setSubmitTarget(null)}
        loading={submitting2}
      />

      <ConfirmModal
        open={!!pickupTarget}
        title="Issue is Solved. Collect Your Assets"
        message="This closes the ticket. Only confirm once you've physically collected the asset from admin."
        subText={pickupTarget?.ticket_code}
        confirmLabel="I Received It"
        confirmColor="green"
        onConfirm={handlePickupConfirmed}
        onCancel={() => setPickupTarget(null)}
        loading={confirmingPickup}
      />
    </div>
  );
};

export default MyTicketsPage;
