import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// Initialize the Google Provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export default async function handler(req) {
  // 1. Handle CORS Pre-flight
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Accel-Buffering': 'no', 
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers });
  }

  try {
    const { messages } = await req.json();

    // 2. Stream the response using Gemini Flash (Fastest)
    const result = await streamText({
      model: google('gemini-1.5-flash-latest'),
      messages,
      system: `You are the ScaleVest Elite CFO. Analyze inventory (Chocolates, Biscuits, Ice Cream).`,
    });

    // 3. Convert the result to a Data Stream
    return result.toDataStreamResponse({ headers });

  } catch (error) {
    console.error("CFO API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers 
    });
  }
}
