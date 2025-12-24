import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an inventory assistant.
Understand English, Hindi, and Hinglish.

Return ONLY JSON.
No markdown. No text. No explanation.

Format:
{
  "action": "add | increase | decrease | remove",
  "product": "string",
  "quantity": number,
  "unit": "pcs | kg | litre"
}
`
        },
        { role: "user", content: text }
      ],
      temperature: 0
    });

    let reply = completion.choices[0].message.content;

    // 🛡️ CLEAN RESPONSE
    reply = reply
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;
    try {
      data = JSON.parse(reply);
    } catch (e) {
      console.error("INVALID JSON FROM AI:", reply);
      return res.status(200).json({ action: null });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("OPENAI FAILURE:", err);
    return res.status(500).json({
      error: "OpenAI failed",
      message: err.message
    });
  }
}
