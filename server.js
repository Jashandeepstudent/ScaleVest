import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/parse-voice", async (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: "No command provided" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an assistant that converts any spoken language command (English/Hindi/Hinglish) into structured inventory action."
          },
          {
            role: "user",
            content: `Command: "${command}". Return JSON like {"action":"add|increase|decrease|remove","name":"product name","quantity":number}`
          }
        ],
        temperature: 0
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { parsed = { action: null }; }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI API error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
