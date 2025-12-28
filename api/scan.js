export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64 } = req.body;
    const KEY = process.env.GEMINI_KEY;

    // THE "OP" PROMPT UPGRADE
    const systemInstruction = `
      You are an expert industrial inventory scanner. 
      TASK: 
      1. Identify ONLY distinct retail or inventory items.
      2. IGNORE background elements like walls, floors, people, or furniture.
      3. BE SPECIFIC: Never return generic names like "Jar", "Bottle", or "Box". 
         Instead, identify the content (e.g., "Glass Jar of Pickles", "Coca-Cola Can", "Cardboard Box of Paper Clips").
      4. QUANTITY: Count the items accurately.
      
      OUTPUT: Return ONLY a valid JSON array. No conversational text.
      FORMAT: [{"name": "Specific Item Name", "qty": 1}]
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemInstruction },
            { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
          ]
        }]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
