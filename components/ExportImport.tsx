'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';

/**
 * ExportImport Component
 * 
 * Export and import functionality:
 * - Export all data (JSON)
 * - Export content plans (JSON/CSV)
 * - Export analytics (JSON/CSV)
 * - Import data from backup
 */
export default function ExportImport() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async (type: string, format: string = 'json') => {
    setExporting(true);
    setMessage(null);

    try {
      const url = `/api/export?userId=demo-user&type=${type}&format=${format}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setMessage({ type: 'success', text: 'Export completed successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Export failed. Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          data: text,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Import successful! ${result.imported} items imported.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: `Import failed: ${result.errors.join(', ')}`,
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Import failed. Please check your file format.' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Download className="w-10 h-10" />
            Export & Import
          </h1>
          <p className="text-blue-200">Backup and restore your data</p>
        </motion.div>

        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Download className="w-6 h-6" />
            Export Data
          </h2>

          <div className="space-y-4">
            {/* Export All */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold">Export All Data</h3>
                  <p className="text-white/60 text-sm">Export all your content plans, posts, and settings</p>
                </div>
                <button
                  onClick={() => handleExport('all')}
                  disabled={exporting}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {exporting ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileJson className="w-5 h-5" />
                  )}
                  Export JSON
                </button>
              </div>
            </div>

            {/* Export Content Plans */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold">Export Content Plans</h3>
                  <p className="text-white/60 text-sm">Export your content plans in JSON or CSV format</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('content-plan', 'json')}
                    disabled={exporting}
                    className="px-4 py-2 bg-blue-500/20 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <FileJson className="w-4 h-4" />
                    JSON
                  </button>
                  <button
                    onClick={() => handleExport('content-plan', 'csv')}
                    disabled={exporting}
                    className="px-4 py-2 bg-green-500/20 rounded-lg text-green-300 hover:bg-green-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Export Analytics */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold">Export Analytics</h3>
                  <p className="text-white/60 text-sm">Export your analytics data for reporting</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('analytics', 'json')}
                    disabled={exporting}
                    className="px-4 py-2 bg-blue-500/20 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <FileJson className="w-4 h-4" />
                    JSON
                  </button>
                  <button
                    onClick={() => handleExport('analytics', 'csv')}
                    disabled={exporting}
                    className="px-4 py-2 bg-green-500/20 rounded-lg text-green-300 hover:bg-green-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Import Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Import Data
          </h2>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10 border-dashed">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <Upload className="w-12 h-12 text-white/60 mb-4" />
              <span className="text-white font-semibold mb-2">Choose a file to import</span>
              <span className="text-white/60 text-sm mb-4">JSON format only</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
              <button
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                disabled={importing}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Select File
                  </>
                )}
              </button>
            </label>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'bg-red-500/20 border border-red-500/30'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-300" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-300" />
              )}
              <span className={message.type === 'success' ? 'text-green-300' : 'text-red-300'}>
                {message.text}
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

