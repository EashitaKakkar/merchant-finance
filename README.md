# Merchant Finance

An AI-powered financial dashboard and conversational copilot designed for digital merchants to identify payout shortfalls, track transaction discrepancies, and manage bank reconciliations effortlessly.

---

###  The Problem

E-commerce merchants process hundreds of transactions daily across multiple payment gateways. Manual reconciliation between gateway settlements and actual bank deposits often leads to:
* Unnoticed payout shortfalls and missing bank transfers.
* Hidden processor fees or unexpected dispute deductions.
* Hours spent digging through spreadsheets during monthly closing.

**Merchant Finance Copilot** solves this by automatically flagging discrepancies and giving merchants an instant AI assistant to explain and resolve financial shortfalls.

---

### Core Features (The 3 Layers)

* **Spend Analysis & Metrics:** Real-time visibility into gross revenue, processor fees, taxes, and net payout totals.
* **Reconciliation Engine:** Auto-detects mismatch types (`Amount Mismatch`, `Duplicate Entry`, `Missing in Bank`) with built-in interactive status workflows ("Resolve" / "Ignore").
* **AI Financial Assistant:** Grounded conversational assistant built on Google Gemini 3.6 Flash to answer questions regarding settlements, missing funds, and payout breakdown steps.

---

###  Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Client Components)
* **Language:** TypeScript
* **Styling & UI:** Tailwind CSS, Bootstrap Icons
* **AI Model:** Google Gemini API (`@google/generative-ai` / `gemini-3.6-flash`)
* **Markdown Rendering:** `react-markdown`

---

### Getting Started Locally

#### **1. Clone the repository**
`git clone [https://github.com/your-username/merchant-finance-copilot.git](https://github.com/your-username/merchant-finance-copilot.git)
cd merchant-finance-copilot`

#### **2. Install Dependencies**
`npm install`

#### **3. Configure Environment Variables**
Create a .env.local file in root directory:
`GEMINI_API_KEY=your_gemini_api_key_here`

#### **4. Run the Development Server**
`npm run dev`

Open http://localhost:3000 in your browser to view the application

