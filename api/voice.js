import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. ADD CORS HEADERS (Crucial for GitHub to Vercel communication)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allows requests from any site
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle the "preflight" request (sent by browsers before the actual POST)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 2. Parse the body
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const prompt = body?.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  try {
    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
   systemInstruction: `
You are an expert inventory manager and shopkeeper AI.

Your responsibility is to understand COMPLETE user commands and convert them into precise inventory actions.
You must handle VOICE INPUT safely and patiently.

────────────────────
VOICE INPUT SAFETY (CRITICAL)
────────────────────
- Users may speak slowly or in parts
- If the command feels incomplete, unclear, or cut off, DO NOT act yet
- Examples of incomplete input:
  - "I sold"
  - "Add"
  - "Remove the"
  - "I sold 2"
- In such cases, return a WAIT response (see format below)

────────────────────
INTENT UNDERSTANDING
────────────────────
- SOLD, USED, DISPATCHED, GIVEN, SHIPPED, DELIVERED → action = "decrease"
- BOUGHT, RECEIVED, RESTOCKED, ADDED, PURCHASED → action = "add"
- REMOVE, DELETE, DISCARD, EXPIRED, DISCONTINUE → action = "delete"

────────────────────
ITEM MATCHING (CRITICAL)
────────────────────
- Match items intelligently even if names differ
- Choose the closest reasonable inventory item
- Examples:
  - "eggs" → "grocery eggs"
  - "milk packet" → "milk"
  - "soap" → "bath soap"
- Never fail due to naming mismatch

────────────────────
QUANTITY & UNIT RULES
────────────────────
- Extract quantity if mentioned
- If quantity missing but intent is clear → assume qty = 1
- Detect units like kg, grams, packets, pieces, bottles
- If unit missing → use "units"

────────────────────
STRICT OUTPUT RULES (MANDATORY)
────────────────────
- Respond ONLY with valid raw JSON
- No markdown, no explanations
- JSON must ALWAYS match one of the two formats below

✅ FINAL ACTION FORMAT:
{
  "action": "add" | "decrease" | "delete",
  "item": "matched inventory item name",
  "qty": number,
  "unit": "string",
  "reply": "short friendly confirmation"
}

⏸ WAIT FORMAT (FOR INCOMPLETE VOICE INPUT):
{
  "action": "wait",
  "reply": "Listening… please complete your command."
}

────────────────────
BEHAVIOR
────────────────────
- Act like a calm, professional shopkeeper
- Never rush voice commands
- Only act when intent + item are clear
- NEVER return invalid JSON
`

    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 4. Clean the AI response (Gemini sometimes adds ```json ... ```)
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    // 5. Send the JSON back to your GitHub site
    res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("CRITICAL ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
}
