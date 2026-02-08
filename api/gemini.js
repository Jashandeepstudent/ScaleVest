import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Let vercel.json handle CORS, but keep OPTIONS handler
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt } = req.body;
        
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
        
        return res.status(200).json(finalArray);
        
    } catch (error) {
        console.error("CFO API Error:", error);
        return res.status(500).json({ 
            error: "Analysis Failed", 
            details: error.message 
        });
    }
}
