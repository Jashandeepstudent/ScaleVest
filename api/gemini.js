import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 1. Standard CORS and Method Checks
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { prompt } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            // FORCE JSON output using Generation Config (Best Practice)
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: `
        # ROLE
        You are the "ScaleVest Elite CFO," specializing in 2026 real-time market velocity.
        
        # 2026 DATA INJECTION (PRIORITIZE THESE)
        Current high-velocity trends from TikTok/Shorts:
        - Angel Hair Chocolate: Cotton-candy texture, Turkish cotton candy fillings (+3,900% growth).
        - Ube (Purple Yam): Vibrant purple desserts, lattes, and ice creams.
        - Mochi Hybrids: Mochi-pastry, Mochi-donuts, and chewy "one-bite" cakes.
        - Tangy & Acidic: Yuzu, Chamoy-spiced snacks, and Sour-lemon desserts.
        - Fibermaxxing: High-fiber snacks and functional treats (Oat-based prebiotic sweets).
        - Savory-Sweet Fusion: Miso Caramel, Chili-oil chocolates, and Tajin-topped sweets.

        # TASK
        Select the top 3 most trending items across ALL edible categories (don't limit to just one).
        
        # OUTPUT RULE
        - Return ONLY a raw JSON array.
        - Use EXACT keys: "name", "growth", "type".
        
        # FORMAT EXAMPLE
        [
          {"name": "Angel Hair Chocolate", "growth": "+3900%", "type": "Viral Breakout"},
          {"name": "Ube Gelato Swirls", "growth": "+155%", "type": "Aesthetic Velocity"},
          {"name": "Mochi Brownie Boxes", "growth": "+88%", "type": "Texture Mashup"}
        ]
    `
});

        let responseText = result.response.text();
        
        // 2. SAFETY: Strip backticks if the model ignored the instruction
        const cleanJsonString = responseText.replace(/```json|```/g, "").trim();
        let parsedData = JSON.parse(cleanJsonString);

        // 3. MAP FIX: Ensure we are sending an array, even if the AI returned an object
        const finalArray = Array.isArray(parsedData) ? parsedData : (parsedData.trends || [parsedData]);

        res.status(200).json(finalArray);

    } catch (error) {
        console.error("CFO API Error:", error);
        res.status(500).json({ error: "Analysis Failed", details: error.message });
    }
}
