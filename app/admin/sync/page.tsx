'use client';

import { useState } from 'react';

interface SyncResult {
  success: boolean;
  timestamp?: string;
  duration?: string;
  results?: {
    updated: number;
    skipped: number;
    failed: number;
    total: number;
  };
  error?: string;
  message?: string;
}

export default function SyncAdminPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [status, setStatus] = useState<any>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);

    try {
      const response = await fetch('/api/cron/sync-visitors', {
        method: 'GET',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync'
      });
    } finally {
      setSyncing(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/sync');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Visitor Sync Admin
        </h1>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Integration Status</h2>
            <button
              onClick={checkStatus}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Refresh Status
            </button>
          </div>

          {status && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.integrations?.posthog ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-700">PostHog: {status.integrations?.posthog ? 'Connected' : 'Not configured'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.integrations?.tally ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-gray-700">Tally: {status.integrations?.tally ? 'Connected' : 'Not configured'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.integrations?.slack ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-gray-700">Slack: {status.integrations?.slack ? 'Connected' : 'Not configured'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sync Control */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Sync</h2>
          <p className="text-gray-600 mb-4">
            Manually trigger a sync to update all visitor counts from PostHog.
          </p>

          <button
            onClick={handleSync}
            disabled={syncing}
            className={`px-6 py-3 font-medium text-white rounded-lg ${
              syncing
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {syncing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Syncing...
              </span>
            ) : (
              'Start Sync'
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-lg shadow-sm border p-6 ${
            result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              result.success ? 'text-green-900' : 'text-red-900'
            }`}>
              {result.success ? 'Sync Completed' : 'Sync Failed'}
            </h2>

            {result.success && result.results && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white rounded-md p-3 border border-green-200">
                    <div className="text-gray-600">Total Metrics</div>
                    <div className="text-2xl font-bold text-gray-900">{result.results.total}</div>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-green-200">
                    <div className="text-gray-600">Updated</div>
                    <div className="text-2xl font-bold text-green-600">{result.results.updated}</div>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-green-200">
                    <div className="text-gray-600">Already Current</div>
                    <div className="text-2xl font-bold text-blue-600">{result.results.skipped}</div>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-green-200">
                    <div className="text-gray-600">Failed</div>
                    <div className="text-2xl font-bold text-red-600">{result.results.failed}</div>
                  </div>
                </div>

                {result.duration && (
                  <p className="text-sm text-gray-600 mt-4">
                    Completed in {result.duration}
                  </p>
                )}

                {result.timestamp && (
                  <p className="text-sm text-gray-600">
                    Last sync: {new Date(result.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {!result.success && (
              <div className="text-red-800">
                <p className="font-medium">{result.message || result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Documentation Links */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Automated Syncing
          </h3>
          <p className="text-blue-800 mb-4">
            For production, set up automated syncing using webhooks or cron jobs.
            See <code className="bg-blue-100 px-2 py-1 rounded">REAL_TIME_SYNC_SETUP.md</code> for details.
          </p>
          <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
            <li>PostHog Webhook for real-time updates</li>
            <li>Vercel Cron for scheduled syncing</li>
            <li>GitHub Actions for automated updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
