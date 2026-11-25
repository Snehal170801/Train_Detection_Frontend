// client/src/components/vendors/VendorViewModal.jsx
import VendorStatusBadge from "./VendorStatusBadge";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right break-words max-w-[220px]">
        {value || "—"}
      </span>
    </div>
  );
}

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

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr.replace("Z", "")).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function VendorViewModal({ vendor, onClose }) {
  if (!vendor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Vendor Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {getInitials(vendor.vendor_name)}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">
              {vendor.vendor_name}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {vendor.vendor_code && (
                <span className="inline-flex px-2 py-0.5 rounded-lg bg-gray-100 text-xs font-mono font-semibold text-gray-600">
                  {vendor.vendor_code}
                </span>
              )}
              <VendorStatusBadge isActive={vendor.is_active} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-2 flex-1 overflow-y-auto">
          {/* Contact */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1">
            Contact
          </p>
          <Row label="Contact Number" value={vendor.phone} />
          <Row label="Mail ID" value={vendor.email} />

          {/* Address */}
          {vendor.address && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1">
                Address
              </p>
              <Row label="Address" value={vendor.address} />
            </>
          )}

          {/* Meta */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1">
            Record Info
          </p>
          <Row label="Created" value={formatDate(vendor.created_at)} />
          <Row label="Updated" value={formatDate(vendor.updated_at)} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
