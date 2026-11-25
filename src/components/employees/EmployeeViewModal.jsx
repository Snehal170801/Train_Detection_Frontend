// client/src/components/employees/EmployeeViewModal.jsx

import { useEffect, useState } from "react";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import { getAssetsApi } from "../../api/assetApi";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right break-words max-w-[200px]">
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

export default function EmployeeViewModal({ employee, onClose }) {
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  useEffect(() => {
    if (!employee) return;
    setAssetsLoading(true);
    getAssetsApi({ assignedEmployeeId: employee.id, limit: 100 }).then((res) => {
      if (res.success) setAssets(res.data?.assets || []);
      setAssetsLoading(false);
    });
  }, [employee]);

  if (!employee) return null;

  // API already returns dept_name and location_name joined from DB
  const departmentName = employee.dept_name || null;
  const locationName = employee.location_name || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Employee Details</h2>
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
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {getInitials(employee.full_name)}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">
              {employee.full_name}
            </p>
            {employee.designation && (
              <p className="text-sm text-gray-500 mt-0.5">
                {employee.designation}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              {employee.employee_code && (
                <span className="inline-flex px-2 py-0.5 rounded-lg bg-gray-100 text-xs font-mono font-semibold text-gray-600">
                  {employee.employee_code}
                </span>
              )}
              <EmployeeStatusBadge isActive={employee.is_active} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-2 overflow-y-auto flex-1">
          <Row label="Employee ID" value={employee.emp_id} />
          <Row label="Location" value={locationName} />
          <Row label="Department" value={departmentName} />
          <Row label="Email" value={employee.email} />
          <Row label="Phone" value={employee.phone} />
          <Row label="Created" value={formatDate(employee.created_at)} />

          {/* Assigned assets */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Assigned Assets</span>
              <span className="inline-flex px-2 py-0.5 rounded-lg bg-gray-100 text-xs font-semibold text-gray-600">
                {assetsLoading ? "…" : assets.length}
              </span>
            </div>

            {assetsLoading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : assets.length === 0 ? (
              <p className="text-sm text-gray-400">No assets assigned.</p>
            ) : (
              <ul className="space-y-2">
                {assets.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {a.asset_name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {a.asset_code}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 flex-shrink-0 ml-2">
                      {a.category_name || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
