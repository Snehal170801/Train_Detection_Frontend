import {
  Eye,
  Pencil,
  Ban,
  CheckCircle,
  Trash2,
  Search,
  ChevronDown,
  ArrowUpDown,
  Plus,
} from "lucide-react";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#8B1A1A",
  primaryLight: "#FFF5F5",
  headerBg: "#8B1A1A",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
  activeDot: "#22C55E",
  activeBadgeBg: "#DCFCE7",
  activeBadgeText: "#15803D",
  inactiveDot: "#EF4444",
  inactiveBadgeBg: "#FEE2E2",
  inactiveBadgeText: "#B91C1C",
  rowHover: "#FDF8F8",
  rowZebra: "#FAFAFA",
};

const pulseStyle = `
  @keyframes pulse-dot {
    0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
    70%  { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }
  .pulse-active { animation: pulse-dot 1.8s infinite; }
`;

function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const styles = {
  page: { fontFamily: "'Segoe UI', sans-serif" },
  pageHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  titleAccent: { display: "flex", alignItems: "center", gap: "10px" },
  accentBar: {
    width: "4px",
    height: "32px",
    borderRadius: "4px",
    background: "linear-gradient(180deg, #8B1A1A 0%, #C0392B 100%)",
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: C.primary,
    margin: 0,
    lineHeight: 1.2,
  },
  pageSubtitle: { fontSize: "13px", color: C.textLight, marginTop: "4px" },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #8B1A1A 0%, #6E1515 100%)",
    color: C.white,
    border: "none",
    borderRadius: "50px",
    padding: "10px 22px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 14px rgba(139,26,26,0.35)",
  },
  card: {
    backgroundColor: C.white,
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "20px",
    border: "1px solid rgba(0,0,0,0.04)",
  },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },
  searchWrapper: { flex: 1, position: "relative" },
  searchInput: {
    width: "100%",
    padding: "10px 44px 10px 18px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "50px",
    fontSize: "14px",
    color: C.text,
    outline: "none",
    backgroundColor: "#FAFAFA",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  searchIcon: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: C.textLight,
    pointerEvents: "none",
  },
  filterSelect: {
    padding: "10px 18px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "50px",
    fontSize: "14px",
    color: C.text,
    backgroundColor: "#FAFAFA",
    cursor: "pointer",
    outline: "none",
    whiteSpace: "nowrap",
    appearance: "none",
    WebkitAppearance: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  filterWrapper: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  filterChevron: {
    position: "absolute",
    right: "12px",
    pointerEvents: "none",
    color: C.textLight,
  },
  tableWrapper: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "calc(100vh - 320px)",
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "600px" },
  thead: { backgroundColor: C.headerBg, position: "sticky", top: 0, zIndex: 2 },
  th: {
    color: C.white,
    fontWeight: "600",
    fontSize: "13px",
    padding: "14px 16px",
    textAlign: "left",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    backgroundColor: C.headerBg,
  },
  thCenter: { textAlign: "center" },
  tr: { borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" },
  td: {
    padding: "13px 16px",
    fontSize: "14px",
    color: C.text,
    verticalAlign: "middle",
  },
  nameText: {
    fontWeight: "700",
    fontSize: "13.5px",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: "0.01em",
  },
  subText: { fontSize: "12px", color: C.textLight, marginTop: "2px" },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #C21807 0%, #8B1A1A 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: C.white,
    fontSize: "11px",
    fontWeight: "700",
    flexShrink: 0,
  },
  codeBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "6px",
    backgroundColor: "#F3F4F6",
    color: "#374151",
    fontSize: "12px",
    fontFamily: "monospace",
    fontWeight: "600",
  },
  badge: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 13px",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: active ? C.activeBadgeBg : C.inactiveBadgeBg,
    color: active ? C.activeBadgeText : C.inactiveBadgeText,
    boxShadow: active
      ? "0 1px 4px rgba(34,197,94,0.2)"
      : "0 1px 4px rgba(239,68,68,0.15)",
  }),
  dot: (active) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: active ? C.activeDot : C.inactiveDot,
    flexShrink: 0,
  }),
  actionsCell: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
  },
  actionBtn: (color) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    color: color || C.primary,
    display: "flex",
    alignItems: "center",
    transition: "background 0.15s, transform 0.1s",
  }),
  emptyRow: {
    textAlign: "center",
    color: C.textLight,
    padding: "40px",
    fontSize: "14px",
  },
  paginationRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "14px",
    fontSize: "13px",
    color: C.textLight,
  },
  pageBtn: (disabled) => ({
    padding: "6px 16px",
    borderRadius: "50px",
    border: `1.5px solid ${C.border}`,
    background: C.white,
    fontSize: "13px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    color: C.text,
    transition: "all 0.15s",
  }),
};

const SORT_OPTIONS = [
  { value: "code_asc", label: "Code (Low to High)" },
  { value: "code_desc", label: "Code (High to Low)" },
  { value: "emp_id_asc", label: "Employee ID (Low to High)" },
  { value: "emp_id_desc", label: "Employee ID (High to Low)" },
  { value: "name_asc", label: "Name (A to Z)" },
  { value: "name_desc", label: "Name (Z to A)" },
  { value: "designation_asc", label: "Designation (A to Z)" },
  { value: "designation_desc", label: "Designation (Z to A)" },
  { value: "department_asc", label: "Department (A to Z)" },
  { value: "department_desc", label: "Department (Z to A)" },
  { value: "location_asc", label: "Location (A to Z)" },
  { value: "location_desc", label: "Location (Z to A)" },
  { value: "date_added_desc", label: "Date Added (Newest First)" },
  { value: "date_added_asc", label: "Date Added (Oldest First)" },
];

export default function EmployeeTable({
  employees = [],
  loading,
  total,
  page,
  totalPages,
  onPageChange,
  canAdmin,
  canManager,
  canEdit = canManager,
  locations = [],
  allDepartments = [],
  search = "",
  setSearch,
  statusFilter = "",
  setStatusFilter,
  locationFilter = "",
  setLocationFilter,
  departmentFilter = "",
  setDepartmentFilter,
  sortBy = "code_asc",
  setSortBy,
  onAdd,
  onBulkUpload,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  // Server already returns the correctly filtered + sorted page — no
  // client-side re-filtering/sorting here (that would only apply to the
  // current page's 10 rows, not the whole dataset).
  const sorted = employees;

  return (
    <div style={styles.page}>
      <style>{pulseStyle}</style>

      {/* ── Page Header ── */}
      <div style={styles.pageHeaderRow}>
        <div style={styles.titleAccent}>
          <div style={styles.accentBar} />
          <div>
            <h1 style={styles.pageTitle}>Employees</h1>
            <p style={styles.pageSubtitle}>
              Manage employees for asset assignment across locations
            </p>
          </div>
        </div>
        {canManager && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{
                ...styles.addBtn,
                background: "#FFFFFF",
                color: C.primary,
                border: `1.5px solid ${C.border}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onClick={onBulkUpload}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#FDF8F8";
                e.currentTarget.style.borderColor = C.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.borderColor = C.border;
              }}
            >
              Bulk Upload
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
              </svg>
            </button>
            <button
              style={styles.addBtn}
              onClick={onAdd}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(139,26,26,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(139,26,26,0.35)";
              }}
            >
              Add Employee <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* ── Card ── */}
      <div style={styles.card}>
        {/* Controls */}
        <div style={styles.controlsRow}>
          {/* Search */}
          <div style={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = C.primary;
                e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.border;
                e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            />
            <span style={styles.searchIcon}>
              <Search size={17} />
            </span>
          </div>

          {/* Status filter */}
          <div style={styles.filterWrapper}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...styles.filterSelect, paddingRight: "36px" }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span style={styles.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>

          {/* Location filter */}
          <div style={styles.filterWrapper}>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{ ...styles.filterSelect, paddingRight: "36px" }}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.location_name}
                </option>
              ))}
            </select>
            <span style={styles.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>

          {/* Department filter */}
          <div style={styles.filterWrapper}>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ ...styles.filterSelect, paddingRight: "36px" }}
            >
              <option value="">All Departments</option>
              {allDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.dept_name}
                </option>
              ))}
            </select>
            <span style={styles.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>

          {/* Sort filter — one dropdown for all sort options */}
          <div style={styles.filterWrapper}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ ...styles.filterSelect, paddingRight: "36px" }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span style={styles.filterChevron}>
              <ArrowUpDown size={14} />
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Email ID</th>
                <th style={{ ...styles.th, ...styles.thCenter }}>Status</th>
                <th style={{ ...styles.th, ...styles.thCenter }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={styles.emptyRow}>
                    Loading...
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.emptyRow}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                sorted.map((emp, idx) => (
                  <tr
                    key={emp.id ?? idx}
                    style={{
                      ...styles.tr,
                      backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 1 ? C.rowZebra : C.white)
                    }
                  >
                    {/* Code */}
                    <td style={styles.td}>
                      <span style={styles.codeBadge}>
                        {emp.employee_code ?? "—"}
                      </span>
                    </td>

                    {/* Employee ID */}
                    <td style={styles.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {emp.emp_id || "—"}
                      </span>
                    </td>

                    {/* Employee name + email */}
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div style={styles.avatar}>
                          {getInitials(emp.full_name)}
                        </div>
                        <div>
                          <div style={styles.nameText}>{emp.full_name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Designation */}
                    <td style={styles.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {emp.designation || "—"}
                      </span>
                    </td>

                    {/* Department */}
                    <td style={styles.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {emp.dept_name || "—"}
                      </span>
                    </td>

                    {/* Email */}
                    <td style={styles.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {emp.email || "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={styles.badge(emp.is_active)}>
                        <span
                          className={emp.is_active ? "pulse-active" : ""}
                          style={styles.dot(emp.is_active)}
                        />
                        {emp.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ ...styles.td, padding: "13px 8px" }}>
                      <div style={styles.actionsCell}>
                        {/* View */}
                        <button
                          style={styles.actionBtn("#555")}
                          onClick={() => onView?.(emp)}
                          title="View"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(0,0,0,0.06)";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        {/* Edit */}
                        {canManager && (
                          <button
                            style={styles.actionBtn("#2563EB")}
                            onClick={() => onEdit?.(emp)}
                            title="Edit"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(37,99,235,0.08)";
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        {/* Toggle status */}
                        {canEdit && (
                          <button
                            style={styles.actionBtn(
                              emp.is_active ? "#D97706" : "#16A34A",
                            )}
                            onClick={() => onToggleStatus?.(emp)}
                            title={emp.is_active ? "Deactivate" : "Activate"}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = emp.is_active
                                ? "rgba(217,119,6,0.08)"
                                : "rgba(22,163,74,0.08)";
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            {emp.is_active ? (
                              <Ban size={15} />
                            ) : (
                              <CheckCircle size={15} />
                            )}
                          </button>
                        )}

                        {/* Delete */}
                        {canAdmin && (
                          <button
                            style={styles.actionBtn("#DC2626")}
                            onClick={() => onDelete?.(emp)}
                            title="Delete"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(220,38,38,0.08)";
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={styles.paginationRow}>
            <span>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={styles.pageBtn(page === 1)}
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                Previous
              </button>
              <button
                style={styles.pageBtn(page === totalPages)}
                disabled={page === totalPages}
                onClick={() => onPageChange?.(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
