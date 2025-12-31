export default async function handler(req, res) {
    const { productName } = req.query;
    const GEMINI_KEY = process.env.GEMINI_KEY; // Hidden in Vercel Dashboard

    const prompt = {
        contents: [{
            parts: [{
                text: `Provide real-world origin and a 2-sentence story for the product "${productName}". 
                Also provide a sustainability score between 1 and 100. 
                Format the response as JSON: {"origin": "...", "story": "...", "score": 85}`
            }]
        }]
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            body: JSON.stringify(prompt)
        });
        
        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        // Clean the JSON string if Gemini adds markdown code blocks
        const jsonOnly = textResponse.replace(/```json|```/g, "").trim();
        
        res.status(200).json(JSON.parse(jsonOnly));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch from Gemini" });
    }
}
