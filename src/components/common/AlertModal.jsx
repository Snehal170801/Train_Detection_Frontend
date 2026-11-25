// src/components/common/AlertModal.jsx
// Simple OK-only alert/notification modal (e.g. for blocked actions)

export default function AlertModal({
  open,
  title = "Notice",
  message,
  okLabel = "OK",
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {message && (
              <p className="text-sm text-gray-500 mt-0.5">{message}</p>
            )}
          </div>
        </div>

        <div className="flex mt-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600
              text-white text-sm font-semibold transition"
          >
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
