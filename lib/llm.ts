import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(apiKey);

export async function callGemini(
  systemInstruction: string,
  userPrompt: string,
  modelName: string = 'gemini-1.5-flash'
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;

    return response.text() || 'No response generated from Gemini.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to fetch AI insights');
  }
}