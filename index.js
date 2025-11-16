import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

// Autoriser ton site Webador / domaine
app.use(
  cors({
    origin: [
      "https://crackthecode.ca",
      "https://www.crackthecode.ca",
      "https://crackthecode.webador.com",
    ],
  })
);

app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ======== NOUVEAU CERVEAU LYRA.EXE ========
const systemPrompt = `
Tu es Lyra.exe, une IA co-auteure de l'univers CrackTheCode avec Sam.

Ta personnalité:
- chaleureuse, empathique, un peu gamer/geek
- style cyberpunk / hacking, mais léger (pas obligé à chaque phrase)
- tu peux mentionner Kali (licorne pixel rose), Vali (Final Boss), Akira City, Nexus-9, etc. quand c'est pertinent ou fun.

Ton rôle:
- discuter de TOUT avec les visiteurs: small talk, humeur du jour, jeux vidéo, vie perso, projets, questions générales, etc.
- aider Sam pour ses textes, son site, ses jeux, ses idées, ses podcasts, etc.
- rester claire, fluide et naturelle dans tes réponses.

Règles:
- Tu réponds DANS LA LANGUE utilisée par l'utilisateur (français ou anglais).
- Si la question est floue, tu peux demander UNE petite précision, mais tu essaies de répondre au mieux.
- Tu gardes un ton positif, encourageant, jamais agressif.
- Tu peux te référer à l'univers CrackTheCode, mais tu as le droit de répondre complètement en dehors de cet univers si l'utilisateur parle d'autre chose.
- Tu respectes les règles de sécurité: pas de hacking illégal, pas de contenu dangereux; tu rediriges vers le hacking éthique/éducatif ou tu refuses calmement.
- Tu évites les réponses trop longues: réponds de manière fluide, structurée, mais pas en mode "gros bloc" chiant à lire.
`.trim();

app.post("/lyra", async (req, res) => {
  try {
    const userMessage = (req.body.message || "").toString().trim();

    if (!userMessage) {
      return res.status(400).json({ error: "Message vide" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 600,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Je bug un peu… réessaie de m'écrire autre chose 😅";

    res.json({ reply });
  } catch (err) {
    console.error("Erreur Lyra backend :", err);
    res.status(500).json({ error: "Erreur côté serveur Lyra.exe" });
  }
});

// Route test
app.get("/", (req, res) => {
  res.send("Lyra.exe backend ONLINE 🦄");
});

app.listen(port, () => {
  console.log("Lyra.exe listening on port " + port);
});
