import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export default async function handler(req) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        // This tells Vercel NOT to buffer the response
        'X-Accel-Buffering': 'no', 
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const { messages } = await req.json();

        const result = await streamText({
            // Use Flash for faster response to prevent timeouts
            model: google('gemini-1.5-flash-latest'), 
            messages: messages,
            system: `You are the ScaleVest Elite CFO. Analyze inventory (Chocolates, Biscuits, Ice Cream).`,
        });

        // result.toDataStreamResponse handles the streaming headers automatically
        return result.toDataStreamResponse({ headers });

    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: 'Check Vercel Environment Variables' }), { 
            status: 500, 
            headers 
        });
    }
}
