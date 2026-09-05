import React, { useState, useMemo } from 'react';
import { ReconciliationFlag, DiscrepancyType } from '@/lib/types';

interface ReconciliationTableProps {
  flags: ReconciliationFlag[];
  onResolveFlag?: (flagId: string) => void;
  onIgnoreFlag?: (flagId: string) => void;
}

const getSeverityLevel = (difference: number): 'HIGH' | 'MEDIUM' | 'LOW' => {
  const absDiff = Math.abs(difference);
  if (absDiff >= 5000) return 'HIGH';
  if (absDiff >= 1000) return 'MEDIUM';
  return 'LOW';
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function ReconciliationTable({
  flags,
  onResolveFlag,
  onIgnoreFlag,
}: ReconciliationTableProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      const matchesType =
        selectedType === 'ALL' || flag.discrepancyType === selectedType;
      const matchesStatus =
        statusFilter === 'ALL' || flag.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [flags, selectedType, statusFilter]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 border border-slate-200">
        <div className="flex items-center gap-3">
          <label htmlFor="discrepancy-filter" className="text-sm font-medium text-slate-700">
            Discrepancy Type:
          </label>
          
          <select
            id="discrepancy-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            {Object.values(DiscrepancyType).map((type: DiscrepancyType) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="status-filter" className="text-sm font-medium text-slate-700">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNRESOLVED">Unresolved</option>
            <option value="RESOLVED">Resolved</option>
            <option value="IGNORED">Ignored</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-xs uppercase text-slate-700">
            <tr>
              <th className="px-4 py-3">Flag ID / Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Settlement / Bank Ref</th>
              <th className="px-4 py-3 text-right">Expected</th>
              <th className="px-4 py-3 text-right">Actual</th>
              <th className="px-4 py-3 text-right">Difference</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">AI Explanation</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredFlags.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  No flags match the current filters.
                </td>
              </tr>
            ) : (
              filteredFlags.map((flag) => {
                const severity = getSeverityLevel(flag.difference);
                return (
                  <tr key={flag.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">
                      <div className="font-semibold text-slate-900">{flag.id}</div>
                      <div className="text-slate-400">{new Date(flag.flaggedDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {flag.discrepancyType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <div><span className="text-slate-400">STL:</span> {flag.settlementId || 'N/A'}</div>
                      <div><span className="text-slate-400">BNK:</span> {flag.bankTransactionId || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(flag.expectedAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(flag.actualAmount)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${flag.difference < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatCurrency(flag.difference)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          severity === 'HIGH'
                            ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                            : severity === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                            : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                        }`}
                      >
                        {severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-xs text-slate-500" title={flag.aiExplanation}>
                      {flag.aiExplanation || 'No summary available.'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {flag.status === 'UNRESOLVED' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onResolveFlag?.(flag.id)}
                            className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => onIgnoreFlag?.(flag.id)}
                            className="rounded bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                          >
                            Ignore
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 uppercase">
                          {flag.status}
                        </span>
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