import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. CORS HEADERS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 2. Parse Body
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const prompt = body?.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  try {
    // 3. Initialize Gemini using GEMINI_KEY
    // Ensure this matches your Vercel Environment Variable name!
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: `
        You are an expert inventory manager and shopkeeper AI.
        Identify intents: SOLD/USED -> decrease, BOUGHT/RESTOCKED -> add, REMOVE -> delete.
        Match items intelligently (e.g., "eggs" to "grocery eggs").
        Respond ONLY with raw JSON. No markdown.
        
        FORMAT:
        { "action": "add"|"decrease"|"delete", "item": "name", "qty": number, "unit": "string", "reply": "msg" }
        
        If input is incomplete, return:
        { "action": "wait", "reply": "Listening... please complete your command." }
      `
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 4. Clean Markdown formatting
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    // 5. Final Response
    res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("CRITICAL ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
