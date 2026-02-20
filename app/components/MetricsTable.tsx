'use client';

import { useState } from 'react';
import { WeeklyMetrics } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Field } from '@base-ui/react/field';
import { calculateGrowth } from '@/lib/calculations';

interface MetricsTableProps {
  data: WeeklyMetrics[];
  onDelete?: (id: string) => void;
  onUpdate?: () => void;
}

export default function MetricsTable({ data, onDelete, onUpdate }: MetricsTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'visitors' | 'signups' | 'totalSignups' } | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ id: string; field: 'visitors' | 'signups' | 'totalSignups' } | null>(null);

  // Calculate cumulative total signups for each week
  const calculateTotalSignups = (index: number): number => {
    return data.slice(0, index + 1).reduce((sum, m) => sum + m.waitlistSignups, 0);
  };

  const handleEdit = (metric: WeeklyMetrics, field: 'visitors' | 'signups' | 'totalSignups', index: number) => {
    setEditingCell({ id: metric.id, field });
    if (field === 'totalSignups') {
      setEditValue(calculateTotalSignups(index));
    } else {
      setEditValue(field === 'visitors' ? metric.websiteVisitors : metric.waitlistSignups);
    }
  };

  const handleSave = async (metric: WeeklyMetrics, index: number) => {
    if (!editingCell) return;

    setSaving(true);
    try {
      let updateData: any = {
        weekStartDate: metric.weekStartDate,
        weekEndDate: metric.weekEndDate,
        websiteVisitors: editingCell.field === 'visitors' ? editValue : metric.websiteVisitors,
        waitlistSignups: editingCell.field === 'signups' ? editValue : metric.waitlistSignups,
      };

      // If editing total signups, calculate weekly signups from previous week's total
      if (editingCell.field === 'totalSignups') {
        const previousTotal = index > 0 ? calculateTotalSignups(index - 1) : 0;
        const weeklySignups = editValue - previousTotal;
        updateData.waitlistSignups = Math.max(0, weeklySignups); // Ensure non-negative
      }

      const response = await fetch(`/api/metrics/${metric.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setEditingCell(null);
        if (onUpdate) onUpdate();
      } else {
        const errorData = await response.json();
        alert(`Failed to update metric: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error updating metric');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, metric: WeeklyMetrics, index: number) => {
    if (e.key === 'Enter') {
      handleSave(metric, index);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  return (
    <div className="bg-white dark:bg-black rounded-lg shadow border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-black dark:text-white">Weekly Data</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-950">
            <tr>
              <th className="pl-5 pr-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date Range
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                Week #
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                Visitors
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                Signups
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                Total Signups
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">
                WoW Growth
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">
                Conversion Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No data yet. Add your first week of metrics!
                </td>
              </tr>
            ) : (
              data.map((metric, index) => {
                const isEditingVisitors = editingCell?.id === metric.id && editingCell?.field === 'visitors';
                const isEditingSignups = editingCell?.id === metric.id && editingCell?.field === 'signups';
                const isEditingTotalSignups = editingCell?.id === metric.id && editingCell?.field === 'totalSignups';
                const isEditingRow = isEditingVisitors || isEditingSignups || isEditingTotalSignups;
                const totalSignups = calculateTotalSignups(index);
                
                // Calculate week-over-week growth using total signups
                // Formula: (this week's total / last week's total) - 1, expressed as percentage
                let signupsGrowth = 0;
                if (index > 0) {
                  const previousTotal = calculateTotalSignups(index - 1);
                  if (previousTotal > 0) {
                    signupsGrowth = ((totalSignups / previousTotal) - 1) * 100;
                  }
                }

                return (
                  <tr key={metric.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="pl-5 pr-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-left">
                      {format(parseISO(metric.weekStartDate), 'MMM d')} - {format(parseISO(metric.weekEndDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center font-medium">
                      Week {index + 1}
                    </td>

                    {/* Visitors Cell */}
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white relative group"
                      onMouseEnter={() => !isEditingRow && setHoveredCell({ id: metric.id, field: 'visitors' })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isEditingVisitors ? (
                          <Field.Root>
                            <Field.Control
                              type="number"
                              value={editValue}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(parseInt(e.target.value) || 0)}
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, metric, index)}
                              onBlur={() => handleSave(metric, index)}
                              autoFocus
                              className="w-24 px-2 py-0.5 border border-blue-500 dark:border-blue-400 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-center"
                              min="0"
                            />
                          </Field.Root>
                        ) : (
                          <>
                            <span>{metric.websiteVisitors.toLocaleString()}</span>
                            {hoveredCell?.id === metric.id && hoveredCell?.field === 'visitors' && (
                              <button
                                onClick={() => handleEdit(metric, 'visitors', index)}
                                className="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Signups Cell */}
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white relative group"
                      onMouseEnter={() => !isEditingRow && setHoveredCell({ id: metric.id, field: 'signups' })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isEditingSignups ? (
                          <Field.Root>
                            <Field.Control
                              type="number"
                              value={editValue}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(parseInt(e.target.value) || 0)}
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, metric, index)}
                              onBlur={() => handleSave(metric, index)}
                              autoFocus
                              className="w-24 px-2 py-0.5 border border-blue-500 dark:border-blue-400 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-center"
                              min="0"
                            />
                          </Field.Root>
                        ) : (
                          <>
                            <span>{metric.waitlistSignups.toLocaleString()}</span>
                            {hoveredCell?.id === metric.id && hoveredCell?.field === 'signups' && (
                              <button
                                onClick={() => handleEdit(metric, 'signups', index)}
                                className="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Total Signups Cell */}
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white relative group font-medium"
                      onMouseEnter={() => !isEditingRow && setHoveredCell({ id: metric.id, field: 'totalSignups' })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isEditingTotalSignups ? (
                          <Field.Root>
                            <Field.Control
                              type="number"
                              value={editValue}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(parseInt(e.target.value) || 0)}
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, metric, index)}
                              onBlur={() => handleSave(metric, index)}
                              autoFocus
                              className="w-24 px-2 py-0.5 border border-blue-500 dark:border-blue-400 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-center"
                              min="0"
                            />
                          </Field.Root>
                        ) : (
                          <>
                            <span>{totalSignups.toLocaleString()}</span>
                            {hoveredCell?.id === metric.id && hoveredCell?.field === 'totalSignups' && (
                              <button
                                onClick={() => handleEdit(metric, 'totalSignups', index)}
                                className="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Week over Week Growth Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {index > 0 ? (
                        <span className={`font-medium ${signupsGrowth > 7 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {signupsGrowth > 0 ? '+' : ''}{signupsGrowth.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                      {saving && isEditingRow ? (
                        <span className="text-blue-600 dark:text-blue-400">Saving...</span>
                      ) : (
                        `${(metric.conversionRate || 0).toFixed(2)}%`
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
