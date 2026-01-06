import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Use "export const POST" instead of "default function handler"
export const POST = async (req) => {
    try {
        const { messages } = await req.json();

        const result = await streamText({
            model: google('gemini-1.5-flash-latest'),
            messages: messages,
            system: `You are the ScaleVest Elite CFO.`,
        });

        return result.toDataStreamResponse({
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    } catch (error) {
        console.error("CFO Crash:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

// Handle CORS pre-flight
export const OPTIONS = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
};
