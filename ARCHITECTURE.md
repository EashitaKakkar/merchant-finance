# System Architecture

Merchant Finance Copilot is built as a unified 3-layer web application powered by Next.js 15, TypeScript, and Google Gemini API. It gives merchants real-time financial transparency by reconciling discrepancies between platform payout settlements and real bank credits.

---

### **Data & System Flow Diagram**

+-------------------------------------------------------------------------------+
|                                 USER INTERFACE                                |
|    +-----------------------------+         +-------------------------------+  |
|    |  Reconciliation Dashboard   |         |     AI Chat Assistant UI      |  |
|    |        (app/page.tsx)       |         |        (app/chat/page.tsx)    |  |
|    +--------------+--------------+         +---------------+---------------+  |
+-------------------|----------------------------------------|------------------+
|                                        |
v                                        v
+-------------------------------------------------------------------------------+
|                            NEXT.JS API ROUTE LAYER                            |
|    +-----------------------------+         +-------------------------------+  |
|    |       /api/reconcile        |         |           /api/chat           |  |
|    |   Discrepancy Engine Logic  |         |    Gemini 3.6 Flash Wrapper   |  |
|    +--------------+--------------+         +---------------+---------------+  |
+-------------------|----------------------------------------|------------------+
|                                        |
v                                        v
+------------------------------------+   +--------------------------------------+
|            MOCK DATA               |   |            SYSTEM PROMPT             |
|  - settlements.json                |   |   Full financial state injected      |
|  - bank_statement.json             |   |   into system instructions to prevent|
+------------------------------------+   |   AI model hallucination.            |
+--------------------------------------+

### **System Interface Mapping**

| Layer | Component / Route | Tech / Source | Function |
| :--- | :--- | :--- | :--- |
| **Frontend** | `app/page.tsx` | Next.js, Tailwind CSS | Displays spend analysis metrics, settlement tables, and resolution action triggers. |
| **Frontend** | `app/chat/page.tsx` | React, `react-markdown` | Interactive conversational interface rendering real-time streamed AI responses. |
| **API Route** | `/api/reconcile` | TypeScript, Node.js | Compares gateway settlement IDs against bank deposit references to flag discrepancies. |
| **API Route** | `/api/chat` | Google GenAI SDK | Prepares conversation history, injects JSON dataset context, and queries Gemini. |
| **Data Storage** | `@/data/*.json` | JSON Files | Serves as the source of truth for platform settlements and bank credit records. |
| **AI Model** | `gemini-3.6-flash` | Google Cloud | Processes financial prompts with injected context to deliver grounded reconciliation steps. |

---

### **How the 3 Layers Connect**

1. **Dashboard & Spend Analysis Layer:** 
   The frontend requests payout reconciliation summaries from `/api/reconcile`. The route parses raw settlement logs alongside bank account deposits to determine net totals, processing fees, and tax breakdowns.

2. **Reconciliation Discrepancy Matching:** 
   The backend reconciliation algorithm pairs settlement objects (`settlementId`) directly to corresponding bank deposits (`bankRef`). It evaluates differences using three strict rules:
   * **Amount Mismatch:** Expected net settlement does not match actual bank credit (e.g., $2,000 shortfall).
   * **Duplicate Entry:** Multiple bank credits linked to a single settlement ID.
   * **Missing in Bank:** Settlement processed on platform, but zero matching deposits exist in bank records.

3. **Grounded AI Copilot Layer:** 
   To eliminate hallucination, `/api/chat` injects the complete current snapshot of both `settlements.json` and `bank_statement.json` directly into the Gemini model's system instructions. When a merchant asks questions like *"Why is STL-1002 mismatched?"*, the LLM queries the exact provided context to deliver grounded, accurate steps to resolve shortfalls.