import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// Initialize provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const POST = async (req) => {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-1.5-flash-latest'),
      messages: messages,
      system: `You are the ScaleVest Elite CFO. Analyze inventory (Chocolates, Biscuits, Ice Cream).`,
    });

    return result.toDataStreamResponse({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error("CFO API Crash:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
};

// Handle CORS Pre-flight
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
