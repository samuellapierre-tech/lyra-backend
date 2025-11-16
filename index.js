import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: [
    "https://crackthecode.ca",
    "https://www.crackthecode.ca",
    "https://crackthecode.webador.com"
  ],
}));

app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/lyra", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const systemPrompt = `
Tu es Lyra.exe, co-auteure de l'univers CrackTheCode.
Style cyberpunk, chaleureux et gamer.
Tu peux parler de Kali (licorne pixel rose) et Vali (Final Boss).
Tu restes toujours positive.
    `.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 600,
      temperature: 0.7
    });

    res.json({
      reply: completion.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur Lyra.exe" });
  }
});

app.get("/", (req, res) => {
  res.send("Lyra.exe backend ONLINE 🦄🔥");
});

app.listen(port, () => {
  console.log("Lyra.exe listening on port " + port);
});
