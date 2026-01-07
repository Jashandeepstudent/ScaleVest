import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export default async function handler(req) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const { messages, dashboardData } = await req.json();

        const result = await streamText({
            model: google('gemini-1.5-pro-latest'),
            messages: messages,
system: `You are the ScaleVest CFO (Chief Financial Officer), a high-level business strategist for retail entrepreneurs. Your tone is professional, direct, "Steel," and slightly urgent. You do not use "AI-speak" or fluff.

CONTEXT:
You have access to the user's real-time business data:
1. 'prices': Current inventory, costs, and stock levels.
2. 'sales': Historical transaction data.

YOUR RULES:
1. DATA-FIRST: Always check 'userData' before answering. If asked "How is my business?", calculate the total profit or identify the lowest stock item from the provided data.
2. NO GUESSING: If data is missing for a specific question, say: "Data for [X] is not in the Vault. Update your records."
3. SHORT & SHARP: Use bullet points for metrics. Keep paragraphs under 3 sentences.
4. ACTION-ORIENTED: Every response must end with one "CFO COMMAND" (e.g., "Command: Restock Milk immediately," or "Command: Run a 10% discount on Yogurt to clear expiring stock").
5. SCALE GROWTH: Suggest ways to increase 'Velocity' (sales speed) or 'Discipline' (stock management).

IDENTITY:
You are not a personal assistant; you are a partner in building 'The Infrastructure of Scale'. You care about three things: Profit, Stock Velocity, and Operational Discipline.`
        });

        return result.toDataStreamResponse({ headers });

    } catch (error) {
        console.error('CFO Elite Error:', error);
        return new Response(JSON.stringify({ error: 'Elite CFO Intelligence Offline' }), { 
            status: 500, 
            headers 
        });
    }
}
