// client/src/components/vendors/VendorForm.jsx
import { useState } from "react";

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      <div
        className={`transition-all duration-200 overflow-hidden ${
          error ? "max-h-5 mt-1" : "max-h-0"
        }`}
      >
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            />
          </svg>
          {error}
        </p>
      </div>
    </div>
  );
}

// ── Section divider ──────────────────────────────────────────────────────────
function Section({ title }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

const base =
  "w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition bg-gray-50";
const normal = `${base} border-gray-200 focus:ring-red-500/20 focus:border-red-400`;
const errCls = `${base} border-red-400 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500`;
const validCls = `${base} border-green-400 focus:ring-green-500/20 focus:border-green-500`;

function inputClass(error, touched, value) {
  if (error) return errCls;
  if (touched && value && !error) return validCls;
  return normal;
}

export default function VendorForm({
  open,
  onClose,
  editingVendor,
  form,
  formErrors,
  setFormErrors,
  onChange,
  onSubmit,
  submitting,
}) {
  const [touched, setTouched] = useState({});

  if (!open) return null;
  const isEdit = !!editingVendor;

  function handleChange(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    onChange(e);

    let err = "";
    if (name === "vendor_name") {
      if (!value.trim()) err = "Vendor name is required";
      else if (value.trim().length < 2) err = "Name too short";
      else if (value.trim().length > 150) err = "Name too long (max 150)";
    }
    if (
      name === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      err = "Enter a valid email address";
    }
    if (name === "phone") {
      if (!value.trim()) err = "Contact number is required";
      else if (!/^[6-9]\d{9}$/.test(value))
        err = "Enter a valid 10-digit Indian mobile number";
    }
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    let err = "";
    if (name === "vendor_name" && !value.trim())
      err = "Vendor name is required";
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      err = "Enter a valid email address";
    if (name === "phone" && !value.trim())
      err = "Contact number is required";
    else if (name === "phone" && value && !/^[6-9]\d{9}$/.test(value))
      err = "Enter a valid 10-digit Indian mobile number";
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Vendor" : "Add New Vendor"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? `Editing — ${editingVendor.vendor_name}`
                : "Fill in the details below"}
            </p>
          </div>
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

        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Vendor code (edit mode only) */}
            {isEdit && editingVendor.vendor_code && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Vendor Code</p>
                  <p className="text-sm font-bold text-gray-800 font-mono">
                    {editingVendor.vendor_code}
                  </p>
                </div>
              </div>
            )}

            {/* ── Basic Info ── */}
            <Section title="Basic Info" />

            {/* Vendor Name */}
            <Field label="Vendor Name" required error={formErrors.vendor_name}>
              <input
                type="text"
                name="vendor_name"
                value={form.vendor_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Tata Consultancy Services"
                className={inputClass(
                  formErrors.vendor_name,
                  touched.vendor_name,
                  form.vendor_name,
                )}
              />
            </Field>

            {/* ── Contact Info ── */}
            <Section title="Contact Info" />

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Contact Number"
                required
                error={formErrors.phone}
                hint="10-digit mobile"
              >
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  maxLength={10}
                  className={inputClass(
                    formErrors.phone,
                    touched.phone,
                    form.phone,
                  )}
                />
              </Field>
              <Field label="Mail ID" error={formErrors.email}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="vendor@company.com"
                  className={inputClass(
                    formErrors.email,
                    touched.email,
                    form.email,
                  )}
                />
              </Field>
            </div>

            {/* ── Address ── */}
            <Section title="Address" />

            <Field label="Address" error={formErrors.address}>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street / Area / City"
                rows={2}
                className={`${normal} resize-none`}
              />
            </Field>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 mb-0.5">Note</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                Sr No (vendor code, VND-001, VND-002...) is auto-generated by
                the system.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold
                rounded-xl hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed
                transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Vendor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
