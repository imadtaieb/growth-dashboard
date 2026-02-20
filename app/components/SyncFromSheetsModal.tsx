'use client';

import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';

interface SyncFromSheetsModalProps {
  onSuccess: () => void;
}

export default function SyncFromSheetsModal({ onSuccess }: SyncFromSheetsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  const [sheetUrl, setSheetUrl] = useState('');
  const [range, setRange] = useState('Sheet1!A2:D100');

  const handleSync = async () => {
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const response = await fetch('/api/sync/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetUrl,
          range,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync from Google Sheets');
      }

      setSuccess({
        imported: data.imported,
        skipped: data.skipped,
      });

      // Refresh the dashboard after a delay
      setTimeout(() => {
        onSuccess();
        setIsOpen(false);
        setSheetUrl('');
        setSuccess(null);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sync/sheets?url=${encodeURIComponent(sheetUrl)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to Google Sheets');
      }

      alert(`✓ Connection successful!\nFound ${data.rowsFound} rows of data.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger className="px-4 py-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900 text-black dark:text-white rounded-lg font-medium transition-colors flex items-center gap-2">
        <span>📊</span>
        <span>Import from Sheets</span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black bg-opacity-50 z-50" />

        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 z-50 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
            Import from Google Sheets
          </Dialog.Title>
          <Dialog.Close className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            ✕
          </Dialog.Close>
        </div>

            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                  📋 Sheet Format Required:
                </h3>
                <div className="text-blue-700 dark:text-blue-300 space-y-1">
                  <p><strong>Column A:</strong> Week Start Date (YYYY-MM-DD)</p>
                  <p><strong>Column B:</strong> Week End Date (YYYY-MM-DD)</p>
                  <p><strong>Column C:</strong> Website Visitors (number)</p>
                  <p><strong>Column D:</strong> Waitlist Signups (number)</p>
                  <p className="mt-2 pt-2 border-t border-blue-300 dark:border-blue-700">
                    <strong>Important:</strong> Make sure your sheet is publicly accessible
                    (Share → Anyone with link can view)
                  </p>
                </div>
              </div>

              {/* Sheet URL Input */}
              <Field.Root>
                <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Google Sheets URL
                </Field.Label>
                <Field.Control
                  type="url"
                  value={sheetUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSheetUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  disabled={loading}
                />
              </Field.Root>

              {/* Range Input */}
              <Field.Root>
                <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Range (optional)
                </Field.Label>
                <Field.Control
                  type="text"
                  value={range}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Sheet1!A2:D100"
                  disabled={loading}
                />
                <Field.Description className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Default: Sheet1!A2:D100 (fetches first 100 rows)
                </Field.Description>
              </Field.Root>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                  <p className="font-bold">✓ Import successful!</p>
                  <p>Imported {success.imported} new weeks</p>
                  {success.skipped > 0 && (
                    <p>Skipped {success.skipped} weeks (already exist)</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleTest}
                  disabled={loading || !sheetUrl}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900 dark:disabled:bg-gray-800 text-black dark:text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  onClick={handleSync}
                  disabled={loading || !sheetUrl}
                  className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Importing...' : 'Import Data'}
                </button>
                <Dialog.Close
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900 text-black dark:text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </Dialog.Close>
              </div>
            </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
