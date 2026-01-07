import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = { runtime: 'edge' };

export default async function handler(req) {
    // 1. Handle OPTIONS preflight immediately
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': 'http://upscalevest.site',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    try {
        const { message, userData } = await req.json();
        const result = await generateText({
            model: google('gemini-1.5-pro-latest'),
            system: `You are the ScaleVest CFO. Analyze: ${JSON.stringify(userData)}. End with CFO COMMAND.`,
            messages: [{ role: 'user', content: message }],
        });

        return new Response(JSON.stringify({ response: result.text }), {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': 'http://upscalevest.site',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': 'http://upscalevest.site' },
        });
    }
}
