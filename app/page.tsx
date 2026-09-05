'use client';

import React, { useState, useEffect, useMemo } from 'react';
import transactionsData from '@/data/transactions.json';
import subscriptionsData from '@/data/subscriptions.json';
import { SpendAnalysis, ReconciliationFlag, Transaction } from '@/lib/types';
import SpendChart from '@/components/SpendChart';
import RoadmapCard from '@/components/RoadmapCard';
import ReconciliationTable from '@/components/ReconciliationTable';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'copilot' | 'reconciliation' | 'subscriptions'>('copilot');
  const [analysis, setAnalysis] = useState<SpendAnalysis | null>(null);
  const [reconciliationFlags, setReconciliationFlags] = useState<ReconciliationFlag[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingReconcile, setLoadingReconcile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const transactions = transactionsData as Transaction[];

  // Calculate overview metrics from transactions
  const totalSpend = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const recurringSpend = useMemo(() => {
    return transactions
      .filter((t) => t.isRecurring)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const recurringPercentage = totalSpend > 0 ? Math.round((recurringSpend / totalSpend) * 100) : 0;

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const runAiAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await fetch('/api/analyze');
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to analyze spend:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const runReconciliation = async () => {
    setLoadingReconcile(true);
    try {
      const res = await fetch('/api/reconcile');
      const data = await res.json();
      setReconciliationFlags(data.flags || []);
    } catch (err) {
      console.error('Failed to run reconciliation:', err);
    } finally {
      setLoadingReconcile(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initDashboardData = async () => {
      if (!isMounted) return;
      await Promise.all([runAiAnalysis(), runReconciliation()]);
    };

    initDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ₹
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">MerFin</h1>
              <p className="text-xs text-slate-500">
                E-Commerce Spend Analytics & Automated Reconciliation
              </p>
            </div>
          </div>

          {/* 3 Main View Switchers */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('copilot')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'copilot'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span> AI Chat Copilot</span>
            </button>

            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'reconciliation'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Reconciliation</span>
              {reconciliationFlags.length > 0 && (
                <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px]">
                  {reconciliationFlags.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'subscriptions'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span> Subscription Analysis</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Global Key Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Monthly Spend
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                ₹{totalSpend.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {transactions.length} Txns
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Fixed / Recurring Spend
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                ₹{recurringSpend.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                {recurringPercentage}% of total
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Potential Monthly Savings
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-600">
                {analysis?.totalPotentialMonthlySavings !== undefined
                  ? `₹${analysis.totalPotentialMonthlySavings.toLocaleString('en-IN')}`
                  : 'Analyzing...'}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                AI Detected
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Settlement Discrepancies
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-red-600">
                {reconciliationFlags.length} Flagged
              </span>
              <button
                onClick={() => setActiveTab('reconciliation')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Review Payouts
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: AI CHAT COPILOT */}
        {activeTab === 'copilot' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-200 text-xs font-medium px-3 py-1 rounded-full border border-indigo-400/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Gemini Financial Optimization Intelligence
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Interactive Financial Copilot
                  </h2>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Ask questions directly about settlement shortfalls, processor fees, and
                    recurring subscription expenses grounded in real bank records.
                  </p>
                </div>
                <a
                  href="/chat"
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Launch Full Chat Assistant</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Cost Reduction Roadmap</h3>
              {analysis?.recommendations && analysis.recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysis.recommendations.map((rec, idx) => (
                    <RoadmapCard
                      key={rec.id || idx}
                      title={rec.title}
                      description={rec.description}
                      impact={rec.impact}
                      estimatedSavings={rec.estimatedSavings}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  Scanning for financial optimization opportunities...
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: RECONCILIATION */}
        {activeTab === 'reconciliation' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">
                  Payment Gateway & Bank Statement Reconciliation
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Automated comparison of settlement payouts against bank statement credits.
                </p>
              </div>
              <button
                onClick={runReconciliation}
                disabled={loadingReconcile}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
              >
                {loadingReconcile ? 'Matching Payouts...' : 'Re-Run Matcher'}
              </button>
            </div>

            <ReconciliationTable flags={reconciliationFlags} />
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION ANALYSIS */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Tracked Subscriptions & SaaS Health
                  </h3>
                  <p className="text-xs text-slate-500">
                    Utilization scoring powered by usage metrics
                  </p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold border border-indigo-200/60">
                  {subscriptionsData.length} Software Contracts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionsData.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          {sub.serviceName}
                        </h4>
                        <span className="text-[11px] text-slate-500">{sub.category}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.status === 'FLAGGED_FOR_REVIEW'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {sub.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Usage Score:</span>
                        <span
                          className={`font-bold ${
                            sub.usageScore < 40 ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {sub.usageScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sub.usageScore < 40 ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${sub.usageScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Monthly Cost:</span>
                      <span className="font-bold text-slate-900">
                        ₹{sub.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Spend Distribution by Category</h3>
              <SpendChart categoryBreakdown={categoryBreakdown} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}