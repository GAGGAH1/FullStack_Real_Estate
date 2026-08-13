
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ title = 'Confirm', message, confirmLabel = 'Yes, Delete', cancelLabel = 'Cancel', onConfirm, onCancel, loading = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <AlertTriangle className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">{title}</h3>
              {message && <p className="text-sm text-red-800 mt-1">{message}</p>}
            </div>
          </div>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-700 rounded-md">
            <X />
          </button>
        </div>

        <div className="p-4 flex items-center justify-center gap-3 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-rose-600 cursor-pointer px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
