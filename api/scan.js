// api/scan.js
export default async function handler(req, res) {
  // Check if the request is actually a POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Please use POST' });
  }

  const { imageBase64 } = req.body;
  const KEY = process.env.GEMINI_KEY;

  if (!KEY) {
    return res.status(500).json({ error: 'API Key is missing in Vercel settings' });
  }

  try {
    // We use the 'gemini-1.5-flash' model (most stable for vision)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Identify items in image. Return ONLY a JSON array: [{\"name\": \"item\", \"qty\": 5}]" },
            { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    // Send the result back to your frontend
    return res.status(200).json(data);
    
  } catch (error) {
    console.error("Server Side Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
