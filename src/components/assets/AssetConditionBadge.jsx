// client/src/components/assets/AssetConditionBadge.jsx

const CONDITION_STYLES = {
  Good: "bg-green-100 text-green-700 border border-green-200",
  Fair: "bg-amber-100 text-amber-700 border border-amber-200",
  Poor: "bg-orange-100 text-orange-700 border border-orange-200",
  Scrap: "bg-red-100 text-red-700 border border-red-200",
};

// ── "New" is the default/expected state — shown as plain text like other fields ──
const PLAIN_VALUES = ["New"];

const AssetConditionBadge = ({ condition }) => {
  if (!condition || PLAIN_VALUES.includes(condition)) {
    return <span className="text-sm text-gray-800">{condition || "—"}</span>;
  }

  const style =
    CONDITION_STYLES[condition] ||
    "bg-gray-100 text-gray-600 border border-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {condition}
    </span>
  );
};

export default AssetConditionBadge;
