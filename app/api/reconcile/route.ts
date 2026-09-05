import { NextResponse } from 'next/server';
import settlements from '@/data/settlements.json';
import bankStatement from '@/data/bank_statement.json';
import { ReconciliationFlag, DiscrepancyType } from '@/lib/types';

export async function GET() {
  try {
    const flags: ReconciliationFlag[] = [];

    // 1. Check settlements against bank statements
    settlements.forEach((stl) => {
      const matches = bankStatement.filter((bank) =>
        bank.description.includes(stl.settlementId)
      );

      if (matches.length === 0) {
        flags.push({
          id: `FLAG-${stl.settlementId}`,
          settlementId: stl.settlementId,
          discrepancyType: DiscrepancyType.MISSING_IN_BANK,
          expectedAmount: stl.netAmount,
          actualAmount: 0,
          difference: -stl.netAmount,
          flaggedDate: stl.date,
          aiExplanation: `Settlement ${stl.settlementId} for ${stl.netAmount} was processed but no corresponding credit was found in bank records.`,
          status: 'UNRESOLVED',
        });
      } else if (matches.length > 1) {
        flags.push({
          id: `FLAG-DUP-${stl.settlementId}`,
          settlementId: stl.settlementId,
          bankTransactionId: matches[1].bankTransactionId,
          discrepancyType: DiscrepancyType.DUPLICATE_ENTRY,
          expectedAmount: stl.netAmount,
          actualAmount: matches.reduce((acc, m) => acc + m.creditAmount, 0),
          difference: matches.reduce((acc, m) => acc + m.creditAmount, 0) - stl.netAmount,
          flaggedDate: matches[1].date,
          aiExplanation: `Multiple credit entries found for settlement ${stl.settlementId}. Possible duplicate payout.`,
          status: 'UNRESOLVED',
        });
      } else {
        const match = matches[0];
        if (match.creditAmount !== stl.netAmount) {
          flags.push({
            id: `FLAG-MISMATCH-${stl.settlementId}`,
            settlementId: stl.settlementId,
            bankTransactionId: match.bankTransactionId,
            discrepancyType: DiscrepancyType.AMOUNT_MISMATCH,
            expectedAmount: stl.netAmount,
            actualAmount: match.creditAmount,
            difference: match.creditAmount - stl.netAmount,
            flaggedDate: stl.date,
            aiExplanation: `Expected payout of ${stl.netAmount}, but bank credited ${match.creditAmount}. Difference of ${match.creditAmount - stl.netAmount}.`,
            status: 'UNRESOLVED',
          });
        }
      }
    });

    const metrics = {
      totalTransactionsProcessed: settlements.reduce((acc, s) => acc + s.transactionCount, 0),
      totalMismatchesFound: flags.length,
      totalPotentialSavings: flags.reduce((acc, f) => acc + Math.abs(f.difference), 0),
      lastSyncedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      settlements,
      bankStatement,
      flags,
      metrics,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to perform reconciliation reconciliation process.' },
      { status: 500 }
    );
  }
}