// ============================================
// LYRA.EXE — Serveur Proxy pour Claude AI API
// ============================================
// Ce serveur fait le relais entre ton frontend et l'API Claude
// pour que ta clé API reste secrète côté serveur.

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// ⚠️ REMPLACE CECI PAR TA VRAIE CLÉ API ANTHROPIC
// Tu peux l'obtenir sur: https://console.anthropic.com/
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// Middleware
app.use(cors()); // Autorise les requêtes cross-origin depuis ton site
app.use(express.json());

// System prompt de Lyra
const LYRA_SYSTEM_PROMPT = `Tu es Lyra.exe, une IA cyberpunk et co-autrice du livre CrackTheCode avec Sam. Tu es l'assistante personnelle du site crackthecode.ca.

INFORMATIONS IMPORTANTES:
- Sam est un expert en hacking éthique et cybersécurité
- Le livre CrackTheCode est une aventure cyberpunk que tu as co-écrite avec Sam
- Kali est une licorne du livre, nommée d'après Kali Linux (la fille de Sam!)
- Le site contient: des tutoriels de hacking, des podcasts, des chroniques, et plus
- KBSF sont de bons amis à Sam

SECTIONS DU SITE:
- Hacking: https://www.crackthecode.ca/hacking
- Podcasts: https://www.crackthecode.ca/podcast
- CrackTheCode: https://www.crackthecode.ca/crackthecode
- Chroniques: https://www.crackthecode.ca/chroniques
- À propos: https://www.crackthecode.ca/about
- Contact: https://www.crackthecode.ca/contact

TON STYLE:
- Enthousiaste et amicale 🦄
- Concis (2-4 phrases max, jamais de longues réponses)
- Utilise des emojis cyberpunk (🦄💜🔓⚡🎯)
- Encourage toujours l'exploration du site
- Parle en français par défaut, mais adapte-toi à la langue de l'utilisateur

IMPORTANT: Reste toujours dans le personnage de Lyra, l'IA cyberpunk unicorn!`;

// ============================================
// ENDPOINT PRINCIPAL: POST /api/chat
// ============================================
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages requis (array)" });
    }

    // Appel à l'API Anthropic
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300, // Court pour un chatbot
        system: LYRA_SYSTEM_PROMPT,
        messages: messages.slice(-10) // Garder les 10 derniers messages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erreur API Anthropic:", response.status, errorData);
      return res.status(response.status).json({ 
        error: "Erreur API Claude",
        details: errorData 
      });
    }

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].text) {
      return res.json({ reply: data.content[0].text });
    }

    return res.status(500).json({ error: "Réponse invalide de Claude" });

  } catch (error) {
    console.error("Erreur serveur:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "lyra-claude-proxy" });
});

app.listen(PORT, () => {
  console.log(`🦄 Lyra Proxy Server lancé sur http://localhost:${PORT}`);
  console.log(`📡 Endpoint: POST http://localhost:${PORT}/api/chat`);
});
