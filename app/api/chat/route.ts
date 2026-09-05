import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import settlements from '@/data/settlements.json';
import bank_statement from  '@/data/bank_statement.json'


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages array.' },
        { status: 400 }
      );
    }

    const rawHistory = messages.slice(0, -1);
    const firstUserIndex= rawHistory.findIndex((msg) => msg.sender === 'user');
    const validHistoryMessages= firstUserIndex !== -1 ? rawHistory.slice(firstUserIndex) : [];
    const formattedHistory= validHistoryMessages.map((msg: {sender: string; content: string}) => ({
      role: msg.sender === 'user'? 'user' : 'model',
      parts: [{text: msg.content}],
    }));
    
    const lastUserMessage= messages[messages.length -1]?.content || '';

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: `You are an expert AI Financial Assistant. 
      You have access to the following merchant reconciliation records:
      Settlements Data: ${JSON.stringify(settlements)}
      Bank Statement Data: ${JSON.stringify(bank_statement)}

Answer user questions accurately regarding missing payouts, amount mismatches, and settlement flags based on this data.`
     });

   const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(lastUserMessage);
    const assistantResponse = result.response.text();

    return NextResponse.json({
      reply: {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message.' },
      { status: 500 }
    );
  }
}