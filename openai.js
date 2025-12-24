import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { text } = req.body;

    const prompt = `
You are an inventory voice command parser.
User speaks Hindi, English, or Hinglish.

Return ONLY JSON.

Actions:
add, increase, decrease, remove

Defaults:
quantity = 1
unit = pcs

Examples:
"chawal do kilo badhao"
{"action":"increase","product":"chawal","quantity":2,"unit":"kg"}

"add sugar"
{"action":"add","product":"sugar","quantity":1,"unit":"pcs"}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text }
      ]
    });

    const output = completion.choices[0].message.content.trim();

    res.json(JSON.parse(output));
  } catch (e) {
    console.error(e);
    res.json({ action: null });
  }
}
