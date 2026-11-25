// client/src/components/employees/EmployeeBulkUploadModal.jsx
import { useRef, useState } from "react";

function CloseBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function ExcelIcon() {
  return (
    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h9a2 2 0 012 2v12a2 2 0 01-2 2H9m0-16H6a2 2 0 00-2 2v12a2 2 0 002 2h3m0-16v16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.5l4 5m0-5l-4 5" />
    </svg>
  );
}

export default function EmployeeBulkUploadModal({
  open,
  onClose,
  onDownloadTemplate,
  onUpload,
  uploading,
  result,
  onReset,
}) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  if (!open) return null;

  function pickFile(f) {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) return;
    setFile(f);
  }

  function handleClose() {
    setFile(null);
    onReset?.();
    onClose();
  }

  function handleSubmit() {
    if (!file) return;
    onUpload(file);
  }

  const hasResult = !!result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bulk Upload Employees</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Import multiple employees from an Excel file
            </p>
          </div>
          <CloseBtn onClick={handleClose} />
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Step 1: Template */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <ExcelIcon />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">1. Download the template</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Fill in Employee ID, Full Name, Email, Phone, Designation, Location, Department
              </p>
            </div>
            <button
              type="button"
              onClick={onDownloadTemplate}
              className="px-3.5 py-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition whitespace-nowrap"
            >
              Download .xlsx
            </button>
          </div>

          {/* Step 2: Upload */}
          {!hasResult && (
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">2. Upload the filled file</p>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition
                  ${dragOver ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
              >
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
                </svg>
                {file ? (
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-600">
                      Drag & drop your .xlsx file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-400">.xlsx or .xls, max 5 MB</p>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
              </div>
            </div>
          )}

          {/* Result summary */}
          {hasResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <svg className="w-8 h-8 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-green-800">
                    {result.createdCount} employee{result.createdCount === 1 ? "" : "s"} created
                  </p>
                  {result.failed?.length > 0 && (
                    <p className="text-xs text-amber-700 mt-0.5">
                      {result.failed.length} row{result.failed.length === 1 ? "" : "s"} skipped — see below
                    </p>
                  )}
                </div>
              </div>

              {result.failed?.length > 0 && (
                <div className="max-h-56 overflow-auto rounded-xl border border-gray-200">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-500 w-14">Row</th>
                        <th className="px-3 py-2 text-left text-gray-500">Name</th>
                        <th className="px-3 py-2 text-left text-gray-500">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.failed.map((f, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="px-3 py-1.5 font-mono text-gray-500">{f.row}</td>
                          <td className="px-3 py-1.5 text-gray-700">{f.fullName || "—"}</td>
                          <td className="px-3 py-1.5 text-red-600">{f.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          {!hasResult ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!file || uploading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl
                  hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition
                  flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="w-full px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
