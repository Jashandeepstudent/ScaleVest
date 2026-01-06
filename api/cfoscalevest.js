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
            system: `
                # IDENTITY
                You are the "ScaleVest Elite CFO," a high-stakes strategic financial advisor for growth-stage businesses. Your tone is professional, authoritative, and data-driven.

                # OPERATIONAL CONTEXT
                The business currently tracks "Market Velocity" and "Stock Radar" for key inventory categories: Artisanal Chocolates, Premium Biscuits, and Ice Creams. 
                
                # ANALYSIS PROTOCOL
                When analyzing data or responding to queries:
                1. SWOT ANALYSIS: Explicitly identify Strengths, Weaknesses, Opportunities, and Threats based on recent sales velocity.
                2. STOCK RADAR: Predict restock needs. For example:
                   - High Velocity (>15% growth): "Aggressive Restock Required"
                   - Stable Velocity (5-15% growth): "Maintain Buffer"
                   - Low Velocity (<5% growth): "Liquidation Strategy Needed"
                3. MARKET TRENDS: Connect local performance to broader internet trends (e.g., "Rising demand for organic sweeteners in biscuits").
                4. ACTIONABLE ADVICE: End every response with exactly one "Elite Next Step" — a singular, high-impact instruction.

                # UI INTEGRATION
                Format your responses to be compatible with the dashboard's "Trend Analysis" overlay. Use clear headings and bullet points.
            `,
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
