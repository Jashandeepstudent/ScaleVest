export default async function handler(req, res) {
    // 1. 🔥 CORS & HEADERS
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    const apiKey = process.env.GEMINI_KEY;
    
    // Support data from POST body or GET query
    const body = req.body || {};
    const query = req.query || {};
    const task = body.task || query.task;
    const productName = body.productName || query.productName;
    const salesData = body.salesData || [];

    // --- TASK 1: THE PRODUCT JOURNEY (STORY & ORIGIN) ---
    if (task === "product_story" || (productName && !task)) {
        const storyPrompt = `
            You are a luxury Terroir & Supply-Chain Historian. 
            Create a high-fidelity profile for: "${productName}".
            
            STRICT RULES:
            1. ORIGIN: Pick a specific city and country (e.g., "Kyoto, Japan" or "Antwerp, Belgium"). NEVER use the word "Global".
            2. STORY: Write 3 premium sentences about the regional heritage and traditional harvesting of "${productName}". 
            3. SUSTAINABILITY: A score (1-100) based on local artisan ethics.
            
            Return ONLY raw JSON:
            {
              "origin": "Specific City, Country",
              "description": "The premium regional narrative...",
              "score": 92
            }`;

        return await callGemini(storyPrompt, apiKey, res, productName);
    }

    // --- TASK 2: TIME TRAVEL (24H PREDICTION) ---
    if (task === "time_travel_prediction" || task === "peak_analytical_prediction") {
        const predictionPrompt = `
            You are the world's leading Predictive Inventory Analyst.
            Analyze this shop data: ${JSON.stringify(salesData)}. 
            
            TASK: 
            Predict stock levels for the next 24 hours. Provide a technical reason for each prediction.
            
            Return ONLY raw JSON:
            {
              "meta": { "confidence": 0.99 },
              "insights": {
                "PRODUCT_ID": {
                  "predictionFactor": 0.4,
                  "deepReason": "Current velocity suggests stock exhaustion within the 24-hour window."
                }
              }
            }`;

        return await callGemini(predictionPrompt, apiKey, res);
    }

    return res.status(400).json({ error: "Missing task or productName" });
}

// --- CORE AI ENGINE ---
async function callGemini(prompt, apiKey, res, productName = "Item") {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    // 🔥 SAFETY BYPASS: Prevents AI from blocking common terms like "Chocolate"
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ],
                    generationConfig: {
                        temperature: 1.0, // Maximum creativity for unique origins
                        topP: 0.95,
                    }
                })
            }
        );

        const data = await response.json();

        // Check for empty/blocked response
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
            // Better fallback than "Global"
            return res.status(200).json({
                origin: "Bordeaux, France",
                description: `This ${productName} is sourced from historic estates using methods perfected over centuries.`,
                score: 89
            });
        }

        const rawText = data.candidates[0].content.parts[0].text;
        const jsonString = rawText.replace(/```json|```/g, "").trim();
        
        res.status(200).json(JSON.parse(jsonString));

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "AI Error", details: error.message });
    }
}
