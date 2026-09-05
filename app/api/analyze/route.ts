// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/llm';
import transactionsData from '@/data/transactions.json';
import subscriptionsData from '@/data/subscriptions.json';
import { Transaction, Subscription, TransactionCategory } from '@/lib/types';

export async function GET() {
  try {
    const transactions = transactionsData as Transaction[];
    const subscriptions = subscriptionsData as Subscription[];

    const totalSpend = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const categoryBreakdown = transactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    const underutilizedSubs = subscriptions.filter(
      (sub) => (sub.usageScore ?? 100) < 40
    );

    const systemPrompt = `You are an AI CFO for a merchant. Analyze the spending data and generate cost-reduction recommendations. 
Return ONLY valid JSON with no markdown formatting or extra text:
{
  "summary": "2-sentence executive summary of spending health",
  "recommendations": [
    {
      "id": "rec_1",
      "title": "Actionable title",
      "category": "Category Name",
      "potentialSavings": 5000,
      "impactLevel": "HIGH",
      "reasoning": "Clear data-driven explanation",
      "actionableSteps": ["Step 1", "Step 2"]
    }
  ]
}`;

    const userPrompt = `
Total Spend: ₹${totalSpend}
Category Totals: ${JSON.stringify(categoryBreakdown)}
Flagged Low-Usage Subscriptions: ${JSON.stringify(underutilizedSubs)}
Provide 2-3 high-impact cost optimization items.
`;

    const aiResult = await callGemini(systemPrompt, userPrompt);
    let parsedResult;

    try {
      const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch {
      parsedResult = {
        summary: "Analyzed recent spending and identified key targets for optimization.",
        recommendations: []
      };
    }

    return NextResponse.json({
      totalSpend,
      categoryBreakdown,
      activeSubscriptionCount: subscriptions.length,
      aiAnalysis: parsedResult,
    });
  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze spending' },
      { status: 500 }
    );
  }
}