// client/src/components/assets/AssetStatusBadge.jsx

const STATUS_STYLES = {
  InRepair: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  InTransit: "bg-blue-100 text-blue-700 border border-blue-200",
  Disposed: "bg-red-100 text-red-700 border border-red-200",
  Missing: "bg-rose-100 text-rose-800 border border-rose-200",
};

const STATUS_LABELS = {
  Active: "Active",
  InRepair: "In Repair",
  InTransit: "In Transit",
  Disposed: "Disposed",
  Missing: "Missing",
};

// ── "Active" is the default/expected state — shown as plain text like other fields ──
const PLAIN_VALUES = ["Active"];

const AssetStatusBadge = ({ status }) => {
  const label = STATUS_LABELS[status] || status || "—";

  if (!status || PLAIN_VALUES.includes(status)) {
    return <span className="text-sm text-gray-800">{label}</span>;
  }

  const style =
    STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border border-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
};

export default AssetStatusBadge;
