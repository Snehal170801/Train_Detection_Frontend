// client/src/pages/operations/TicketsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Search, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import {
  getTicketsApi,
  acknowledgeTicketApi,
  resolveTicketApi,
  rejectTicketApi,
  acceptSubmissionApi,
  rejectSubmissionApi,
} from "../../api/ticketApi";
import { collectAssetApi } from "../../api/assetApi";
import useAuthStore from "../../store/authStore";
import ConfirmModal from "../../components/common/ConfirmModal";

// ── House table style — matches DisposalTable/TransferTable palette ──────────
const C = {
  primary: "#8B1A1A",
  headerBg: "#8B1A1A",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
  rowHover: "#FDF8F8",
  rowZebra: "#FAFAFA",
};

const S = {
  page: { fontFamily: "'Segoe UI', sans-serif" },
  pageHeaderRow: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    marginBottom: 24, flexWrap: "wrap", gap: 12,
  },
  titleAccent: { display: "flex", alignItems: "center", gap: 10 },
  accentBar: {
    width: 4, height: 32, borderRadius: 4,
    background: "linear-gradient(180deg, #8B1A1A 0%, #C0392B 100%)", flexShrink: 0,
  },
  pageTitle: { fontSize: 26, fontWeight: 700, color: C.primary, margin: 0, lineHeight: 1.2 },
  pageSubtitle: { fontSize: 13, color: C.textLight, marginTop: 4 },
  card: {
    backgroundColor: C.white, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: 20, border: "1px solid rgba(0,0,0,0.04)",
  },
  controlsRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" },
  searchWrapper: { flex: 1, position: "relative", minWidth: 180 },
  searchInput: {
    width: "100%", padding: "10px 44px 10px 18px", border: `1.5px solid ${C.border}`,
    borderRadius: 50, fontSize: 14, color: C.text, outline: "none", backgroundColor: "#FAFAFA",
    boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  searchIcon: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: C.textLight, pointerEvents: "none" },
  filterSelect: {
    padding: "10px 18px", border: `1.5px solid ${C.border}`, borderRadius: 50, fontSize: 14,
    color: C.text, backgroundColor: "#FAFAFA", cursor: "pointer", outline: "none",
    whiteSpace: "nowrap", appearance: "none", WebkitAppearance: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  filterWrapper: { position: "relative", display: "inline-flex", alignItems: "center" },
  filterChevron: { position: "absolute", right: 12, pointerEvents: "none", color: C.textLight },
  clearBtn: {
    padding: "10px 18px", border: `1.5px solid ${C.border}`, borderRadius: 50, fontSize: 13,
    color: C.primary, backgroundColor: "#FFF5F5", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap",
  },
  tableWrapper: {
    overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 320px)",
    borderRadius: 12, border: `1px solid ${C.border}`,
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 860 },
  thead: { backgroundColor: C.headerBg, position: "sticky", top: 0, zIndex: 2 },
  th: {
    color: C.white, fontWeight: 600, fontSize: 13, padding: "14px 16px",
    textAlign: "left", letterSpacing: "0.04em", whiteSpace: "nowrap", backgroundColor: C.headerBg,
  },
  thCenter: { textAlign: "center" },
  tr: { borderBottom: `1px solid ${C.border}`, transition: "background 0.15s", cursor: "pointer" },
  td: { padding: "13px 16px", fontSize: 14, color: C.text, verticalAlign: "middle" },
  codeBadge: {
    display: "inline-block", padding: "2px 8px", borderRadius: 6,
    backgroundColor: "#F3F4F6", color: "#374151", fontSize: 12,
    fontFamily: "monospace", fontWeight: 600,
  },
  nameText: { fontWeight: 600, fontSize: 13, color: C.text },
  subText: { fontSize: 12, color: C.textLight, marginTop: 2 },
  actionBtn: {
    background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8,
    color: "#555", display: "flex", alignItems: "center", transition: "background 0.15s",
  },
  emptyRow: { textAlign: "center", color: C.textLight, padding: 40, fontSize: 14 },
  paginationRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginTop: 14, fontSize: 13, color: C.textLight,
  },
  pageBtn: (disabled) => ({
    padding: "6px 16px", borderRadius: 50, border: `1.5px solid ${C.border}`,
    background: C.white, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1, color: C.text,
  }),
};

const ACTION_CONFIRM = {
  acknowledge: {
    title: "Acknowledge This Ticket?",
    message: "This marks the ticket as In Progress and assigns it to you.",
    confirmLabel: "Yes, Acknowledge",
    confirmColor: "blue",
  },
  resolve: {
    title: "Resolve This Ticket?",
    message: "The employee will be told: \"Issue is Solved. Collect Your Assets.\"",
    confirmLabel: "Yes, Resolve",
    confirmColor: "green",
  },
  reject: {
    title: "Reject This Ticket?",
    message: "The employee will see it as Rejected along with your notes.",
    confirmLabel: "Yes, Reject",
    confirmColor: "red",
  },
  acceptSubmission: {
    title: "Confirm You Received the Asset?",
    message: "This confirms the employee has physically handed over the asset to you.",
    confirmLabel: "Yes, I Have It",
    confirmColor: "green",
  },
  rejectSubmission: {
    title: "Deny Receipt of the Asset?",
    message: "This sends it back to the employee — they'll need to submit it again.",
    confirmLabel: "No, I Don't Have It",
    confirmColor: "red",
  },
};

const CUSTODY_LABELS = {
  AwaitingCollection: "Awaiting collection from employee",
  Submitted: "Submitted — awaiting your confirmation",
  NotReceived: "Marked not received — employee notified",
  WithAdmin: "With admin — being repaired",
  ReadyForPickup: "Ready for pickup",
  Completed: "Returned to employee",
};
const CUSTODY_STYLES = {
  [CUSTODY_LABELS.AwaitingCollection]: { bg: "#F1F5F9", color: "#64748B" },
  [CUSTODY_LABELS.Submitted]: { bg: "#FEF9C3", color: "#A16207" },
  [CUSTODY_LABELS.NotReceived]: { bg: "#FEE2E2", color: "#DC2626" },
  [CUSTODY_LABELS.WithAdmin]: { bg: "#FEF9C3", color: "#A16207" },
  [CUSTODY_LABELS.ReadyForPickup]: { bg: "#DCFCE7", color: "#15803D" },
  [CUSTODY_LABELS.Completed]: { bg: "#F1F5F9", color: "#64748B" },
};

const ACCENT = "#C8102E";

const STATUS_STYLES = {
  Open:                     { bg: "#DBEAFE", color: "#1D4ED8" },
  Reopened:                 { bg: "#DBEAFE", color: "#1D4ED8" },
  "Waiting for Received":   { bg: "#FEF9C3", color: "#A16207" },
  "Awaiting Confirmation":  { bg: "#FEF9C3", color: "#A16207" },
  "Not Received":           { bg: "#FEE2E2", color: "#DC2626" },
  "In Repair":              { bg: "#FEF9C3", color: "#A16207" },
  "Ready for Pickup":       { bg: "#DCFCE7", color: "#15803D" },
  InProgress:               { bg: "#FEF9C3", color: "#A16207" },
  Resolved:                 { bg: "#DCFCE7", color: "#15803D" },
  Rejected:                 { bg: "#FEE2E2", color: "#DC2626" },
};

// InProgress on its own doesn't tell the admin what they're waiting on —
// show what stage of the custody handover it's actually in. A ticket back to
// Open with previous_status set means the employee reopened it, not raised fresh.
const ticketStatusLabel = (ticket) => {
  if (ticket.status === "Open" && ticket.previous_status) return "Reopened";
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

const PRIORITY_STYLES = {
  Low:    { bg: "#F1F5F9", color: "#64748B" },
  Medium: { bg: "#FEF9C3", color: "#A16207" },
  High:   { bg: "#FEE2E2", color: "#DC2626" },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const Badge = ({ label, styleMap }) => {
  const s = styleMap[label] || { bg: "#F1F5F9", color: "#64748B" };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
};

// Label/value row — matches the InfoRow pattern used across other view modals
const InfoRow = ({ label, value }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0",
    borderBottom: "1px solid #F8FAFC",
  }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", width: 110, flexShrink: 0 }}>
      {label}
    </span>
    <span style={{ fontSize: 13, color: "#1E293B", flex: 1 }}>{value ?? "—"}</span>
  </div>
);

const ActionModal = ({ ticket, onClose, onDone, canAct }) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // "acknowledge" | "resolve" | "reject"
  const [rejectDecisionOpen, setRejectDecisionOpen] = useState(false);

  // Ticket was already acknowledged — reject needs a decision on what
  // happens to the asset (issue never got fixed, employee shouldn't keep it).
  const handleRejectClick = () => {
    if (ticket.status === "InProgress") {
      setRejectDecisionOpen(true);
    } else {
      setPendingAction("reject");
    }
  };

  const handleRejectAndAssignToCompany = async () => {
    if (!notes.trim()) {
      toast.error("Please describe why this ticket is being rejected");
      return;
    }
    setSubmitting(true);
    const rejectRes = await rejectTicketApi(ticket.id, notes);
    if (!rejectRes.success) {
      setSubmitting(false);
      toast.error(rejectRes.message);
      return;
    }
    const collectRes = await collectAssetApi(ticket.asset_id, { conditionAtReturn: "", notes });
    setSubmitting(false);
    setRejectDecisionOpen(false);
    if (!collectRes.success) {
      toast.error(`Ticket rejected, but returning the asset to Company failed: ${collectRes.message}`);
      onDone();
      onClose();
      return;
    }
    toast.success("Rejected — asset returned to Company pool");
    onDone();
    onClose();
  };

  const handleRejectAndDispose = async () => {
    if (!notes.trim()) {
      toast.error("Please describe why this ticket is being rejected");
      return;
    }
    setSubmitting(true);
    const rejectRes = await rejectTicketApi(ticket.id, notes);
    setSubmitting(false);
    if (!rejectRes.success) {
      toast.error(rejectRes.message);
      return;
    }
    setRejectDecisionOpen(false);
    onDone();
    onClose();
    navigate(`/operations/disposal?assetId=${ticket.asset_id}&reason=${encodeURIComponent(notes)}`);
  };

  const run = async (action) => {
    setSubmitting(true);
    let res;
    if (action === "acknowledge") res = await acknowledgeTicketApi(ticket.id);
    if (action === "resolve") res = await resolveTicketApi(ticket.id, notes);
    if (action === "reject") res = await rejectTicketApi(ticket.id, notes);
    if (action === "acceptSubmission") res = await acceptSubmissionApi(ticket.id);
    if (action === "rejectSubmission") res = await rejectSubmissionApi(ticket.id);
    setSubmitting(false);
    setPendingAction(null);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    const MESSAGES = {
      resolve: "Resolved — employee can now collect the asset",
      acceptSubmission: "Receipt confirmed",
      rejectSubmission: "Denied — sent back to employee",
      acknowledge: "Ticket acknowledged",
    };
    toast.success(MESSAGES[action] || `Ticket ${action}d`);
    onDone();
    onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 460, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{ticket.ticket_code}</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>{ticket.asset_name} · {ticket.asset_code}</p>
          </div>
          <Badge label={ticketStatusLabel(ticket)} styleMap={STATUS_STYLES} />
        </div>

        <div style={{ padding: "4px 20px 20px", overflowY: "auto", flex: "1 1 auto", minHeight: 0 }}>
          <div style={{ display: "flex", gap: 8, padding: "12px 0", borderBottom: "1px solid #F8FAFC" }}>
            <Badge label={ticket.priority} styleMap={PRIORITY_STYLES} />
            <Badge label={ticket.category || "General"} styleMap={{}} />
          </div>

          {ticket.custody_status && (
            <div style={{ padding: "10px 0", borderBottom: "1px solid #F8FAFC" }}>
              <Badge label={CUSTODY_LABELS[ticket.custody_status] || ticket.custody_status} styleMap={CUSTODY_STYLES} />
            </div>
          )}

          <InfoRow label="Raised By" value={ticket.raised_by_name} />
          <InfoRow label="Employee ID" value={ticket.raised_by_emp_id} />
          <InfoRow label="Raised On" value={fmt(ticket.created_at)} />

          <div style={{ padding: "12px 0 4px" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", margin: "0 0 6px" }}>Description</p>
            <p style={{ fontSize: 13, color: "#1E293B", margin: 0, lineHeight: 1.5 }}>{ticket.description}</p>
          </div>

          {ticket.resolution_notes && (
            <div style={{ marginTop: 14, padding: "10px 12px", background: "#F8FAFC", borderRadius: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", margin: "0 0 4px" }}>Previous response</p>
              <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>{ticket.resolution_notes}</p>
            </div>
          )}

          {canAct && (ticket.status === "Open" || ticket.status === "InProgress") && (
            <>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", margin: "16px 0 6px" }}>
                Resolution notes (shown to employee)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </>
          )}
        </div>

        {canAct && (ticket.status === "Open" || ticket.status === "InProgress") && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button onClick={onClose} disabled={submitting} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              Close
            </button>
            {ticket.status === "Open" && (
              <button onClick={() => setPendingAction("acknowledge")} disabled={submitting} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#1D4ED8", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                Acknowledge
              </button>
            )}
            {ticket.custody_status === "Submitted" ? (
              <>
                <button onClick={() => setPendingAction("rejectSubmission")} disabled={submitting} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #FEE2E2", background: "#fff", color: "#DC2626", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  No, I Haven't Received It
                </button>
                <button onClick={() => setPendingAction("acceptSubmission")} disabled={submitting} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#15803D", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Yes, I Received It
                </button>
              </>
            ) : (
              <>
                <button onClick={handleRejectClick} disabled={submitting} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#DC2626", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Reject
                </button>
                <button onClick={() => setPendingAction("resolve")} disabled={submitting} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#16A34A", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Resolve
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!pendingAction}
        title={pendingAction ? ACTION_CONFIRM[pendingAction].title : ""}
        message={pendingAction ? ACTION_CONFIRM[pendingAction].message : ""}
        subText={ticket.ticket_code}
        confirmLabel={pendingAction ? ACTION_CONFIRM[pendingAction].confirmLabel : ""}
        confirmColor={pendingAction ? ACTION_CONFIRM[pendingAction].confirmColor : "blue"}
        onConfirm={() => run(pendingAction)}
        onCancel={() => setPendingAction(null)}
        loading={submitting}
      />

      {rejectDecisionOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 16 }}
          onClick={(e) => e.target === e.currentTarget && !submitting && setRejectDecisionOpen(false)}
        >
          <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 420, padding: "20px" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1E293B" }}>Reject This Ticket</h3>
            <p style={{ margin: "4px 0 14px", fontSize: 12, color: "#94A3B8" }}>
              {ticket.ticket_code} · The issue hasn't been solved. Tell the employee why, then decide what happens to the asset.
            </p>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Why is this being rejected? *
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Not repairable / beyond economical repair"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button onClick={() => setRejectDecisionOpen(false)} disabled={submitting} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleRejectAndAssignToCompany} disabled={submitting} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#64748B", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Assign To Company
              </button>
              <button onClick={handleRejectAndDispose} disabled={submitting} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#DC2626", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Dispose
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const STATUS_OPTIONS = ["Open", "InProgress", "Resolved", "Rejected"];
const PAGE_SIZE = 20;

const TicketsPage = () => {
  const { hasPermission } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const canAct = hasPermission("tickets", "can_approve");
  const hasActiveFilters = search || statusFilter;

  const load = async () => {
    setLoading(true);
    const res = await getTicketsApi({
      ...(statusFilter ? { status: statusFilter } : {}),
      page,
      limit: PAGE_SIZE,
    });
    if (res.success) {
      setTickets(res.data?.tickets || []);
      setTotalCount(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 1);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusFilter, page]);

  const clearAll = () => {
    setSearch("");
    setStatusFilter("");
    setPage(1);
  };

  const filtered = tickets.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.ticket_code?.toLowerCase().includes(q) ||
      t.asset_name?.toLowerCase().includes(q) ||
      t.asset_code?.toLowerCase().includes(q) ||
      t.raised_by_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={S.page}>
      <div style={S.pageHeaderRow}>
        <div style={S.titleAccent}>
          <div style={S.accentBar} />
          <div>
            <h1 style={S.pageTitle}>Maintenance</h1>
            <p style={S.pageSubtitle}>Full maintenance history — issues raised against assigned assets</p>
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.controlsRow}>
          <div style={S.searchWrapper}>
            <input
              type="text"
              placeholder="Search by ticket, asset, or employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={S.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = C.primary;
                e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.border;
                e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            />
            <span style={S.searchIcon}>
              <Search size={17} />
            </span>
          </div>

          <div style={S.filterWrapper}>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ ...S.filterSelect, paddingRight: 36 }}
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span style={S.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>

          {hasActiveFilters && (
            <button onClick={clearAll} style={S.clearBtn}>
              Clear
            </button>
          )}
        </div>

        <div style={S.tableWrapper}>
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <th style={S.th}>Ticket</th>
                <th style={S.th}>Asset</th>
                <th style={S.th}>Raised By</th>
                <th style={{ ...S.th, ...S.thCenter }}>Priority</th>
                <th style={{ ...S.th, ...S.thCenter }}>Status</th>
                <th style={S.th}>Raised On</th>
                <th style={{ ...S.th, ...S.thCenter }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={S.emptyRow}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={S.emptyRow}>No tickets found.</td></tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr
                    key={t.id}
                    style={{ ...S.tr, backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white }}
                    onClick={() => setSelected(t)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 1 ? C.rowZebra : C.white)}
                  >
                    <td style={S.td}>
                      <span style={S.codeBadge}>{t.ticket_code}</span>
                    </td>
                    <td style={S.td}>
                      <div style={S.nameText}>{t.asset_code}</div>
                      <div style={S.subText}>{t.asset_name}</div>
                    </td>
                    <td style={S.td}>
                      <div style={S.nameText}>{t.raised_by_name}</div>
                      {t.raised_by_emp_id && (
                        <div style={{ ...S.subText, fontFamily: "monospace" }}>Emp ID {t.raised_by_emp_id}</div>
                      )}
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <Badge label={t.priority} styleMap={PRIORITY_STYLES} />
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <Badge label={ticketStatusLabel(t)} styleMap={STATUS_STYLES} />
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: 12, color: C.textLight }}>{fmt(t.created_at)}</span>
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        style={S.actionBtn}
                        onClick={() => setSelected(t)}
                        title={canAct ? "Review" : "View"}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div style={S.paginationRow}>
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.pageBtn(page === 1)} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <button style={S.pageBtn(page === totalPages)} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <ActionModal ticket={selected} onClose={() => setSelected(null)} onDone={load} canAct={canAct} />
      )}
    </div>
  );
};

export default TicketsPage;
