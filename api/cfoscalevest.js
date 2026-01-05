import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// ❌ REMOVE THIS LINE:
// export const config = { runtime: 'edge' }; 

// ✅ Use the default Node.js runtime instead
export default async function handler(req) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-1.5-pro-latest'), // Ensure 'models/' is removed if using AI SDK
    messages: messages,
    system: "You are the ScaleVest Virtual CFO. Provide professional financial insights.",
  });

  return result.toDataStreamResponse();
}
