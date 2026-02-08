import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Explicitly set CORS headers for every request
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Content-Type');

    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow POST for actual requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }
        
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            throw new Error('API key not configured');
        }
        
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: `
                # ROLE
                ScaleVest Elite CFO Market Analyst (Live Data: January 6, 2026).
                
                # 2026 TREND INJECTION (PRIORITIZE THESE)
                1. Angel Hair Chocolate: Turkish cotton candy filling (+3,900% growth).
                2. Protein-Boosted Matcha: Viral "Oatzempic" style or Caramel Protein Matcha (+115%).
                3. Mushroom-Infused Dark Chocolate: Wellness-focused "Mushroom Mocha" bars (+813%).
                4. Swicy Mango Biscuits: Chili-lime and savory-sweet Mexican-style treats.
                5. Freeze-Dried Cheesecake: Ultra-crunchy ASMR "Space Snacks".
                
                # TASK
                Return a JSON array of 3 DIFFERENT items. 
                ENSURE each entry is unique. Do not repeat names.
                Use EXACT keys: "name", "growth", "type".
            `
        });
        
        let responseText = result.response.text();
        const cleanJsonString = responseText.replace(/```json|```/g, "").trim();
        let parsedData = JSON.parse(cleanJsonString);
        const finalArray = Array.isArray(parsedData) ? parsedData : (parsedData.trends || [parsedData]);
        
        res.status(200).json(finalArray);
        
    } catch (error) {
        console.error("CFO API Error:", error);
        res.status(500).json({ 
            error: "Analysis Failed", 
            details: error.message 
        });
    }
}
