'use client';

import { useState } from 'react';
import { getWeekDateRange } from '@/lib/calculations';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';

interface AddMetricFormProps {
  onSuccess: () => void;
}

export default function AddMetricForm({ onSuccess }: AddMetricFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date();
  const { start, end } = getWeekDateRange(today);

  const [formData, setFormData] = useState({
    weekStartDate: start,
    weekEndDate: end,
    websiteVisitors: '',
    waitlistSignups: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekStartDate: formData.weekStartDate,
          weekEndDate: formData.weekEndDate,
          websiteVisitors: parseInt(formData.websiteVisitors),
          waitlistSignups: parseInt(formData.waitlistSignups),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add metric');
      }

      // Reset form
      const newWeek = getWeekDateRange(today);
      setFormData({
        weekStartDate: newWeek.start,
        weekEndDate: newWeek.end,
        websiteVisitors: '',
        waitlistSignups: '',
      });
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-colors">
        + Add Week Data
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black bg-opacity-50 z-50" />

        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 z-50">
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
            Add Weekly Metrics
          </Dialog.Title>
          <Dialog.Close className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            ✕
          </Dialog.Close>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field.Root>
              <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Week Start
              </Field.Label>
              <Field.Control
                type="date"
                value={formData.weekStartDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, weekStartDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </Field.Root>

            <Field.Root>
              <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Week End
              </Field.Label>
              <Field.Control
                type="date"
                value={formData.weekEndDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, weekEndDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </Field.Root>
          </div>

          <Field.Root>
            <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website Visitors
            </Field.Label>
            <Field.Control
              type="number"
              value={formData.websiteVisitors}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, websiteVisitors: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., 1250"
              min="0"
              required
            />
          </Field.Root>

          <Field.Root>
            <Field.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Waitlist Signups
            </Field.Label>
            <Field.Control
              type="number"
              value={formData.waitlistSignups}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, waitlistSignups: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., 45"
              min="0"
              required
            />
          </Field.Root>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Adding...' : 'Add Metrics'}
            </button>
            <Dialog.Close
              type="button"
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900 text-black dark:text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </Dialog.Close>
          </div>
        </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
