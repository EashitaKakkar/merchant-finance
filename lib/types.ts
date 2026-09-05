export type TransactionCategory = 
| 'SaaS & Software'
| 'Digital Marketing'
| 'Logistics & Shipping'
| 'Cloud Infrastructure'
| 'Payroll & Benefits'
| 'Office & Equipment'
| 'Payment Gateway Fees'
| 'Miscellaneous';

export type PaymentMethod= 'UPI'| 'Credit Card' | 'Net Banking' | 'Corporate Card';

export interface Transaction {
    id: string;
    date: string;
    merchantName: string;
    amount: number;
    currency: 'INR' | 'USD';
    category: TransactionCategory;
    paymentMethod: PaymentMethod;
    isRecurring: boolean;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface Subscription {
    id: string;
    serviceName: string;
    billingCycle: 'Yearly' | 'Monthly';
    amount: number;
    lastBilledDate: string;
    nextBillingDate: string;
    category: TransactionCategory;
    status: 'ACTIVE' | 'FLAGGED_FOR_REVIEW' | 'CANCELLED';
    usageScore?: number;
}

export interface RoadmapItem {
    id: string;
    title: string;
    category: TransactionCategory;
    potentialSavings: number;
    impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    actionableSteps: string[];
    reasoning: string;
}

export interface SpendAnalysisSummary{
    totalSpend: number;
    period: string;
    categoryBreakdown: Record<TransactionCategory, number>;
    activeSubscriptionCount: number;
    projectedMonthlyBurn: number;
    roadmap: RoadmapItem[];
}

export interface Settlement {
  settlementId: string;
  date: string;
  grossAmount: number; 
  fees: number; 
  tax: number; 
  netAmount: number; 
  status: 'SETTLED' | 'PENDING';
  transactionCount: number;
}

export interface BankEntry {
  bankTransactionId: string;
  date: string;
  description: string;
  creditAmount: number;
  debitAmount: number;
  balanceAfter: number;
  referenceNo: string;
}

export enum DiscrepancyType {
  MISSING_IN_BANK = 'MISSING_IN_BANK',
  TIMING_DELAY = 'TIMING_DELAY',
  AMOUNT_MISMATCH = 'AMOUNT_MISMATCH',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
}

export interface ReconciliationFlag {
  id: string;
  settlementId?: string;
  bankTransactionId?: string;
  discrepancyType: DiscrepancyType;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  flaggedDate: string;
  aiExplanation?: string; 
  status: 'UNRESOLVED' | 'RESOLVED' | 'IGNORED';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: {
    toolName: string;
    args: Record<string, unknown>;
    result?: unknown;
  }[];
}

export interface SystemMetrics {
  totalTransactionsProcessed: number;
  totalMismatchesFound: number;
  totalPotentialSavings: number;
  lastSyncedAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  category?: string;
  estimatedSavings?: number;
}

export interface SpendAnalysis {
  summary: string;
  totalSpend?: number;
  totalPotentialMonthlySavings?: number;
  recommendations: Recommendation[];
}

