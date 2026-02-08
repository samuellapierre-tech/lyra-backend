const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(cors());
app.use(express.json());

// ============================================
// SYSTEM PROMPTS
// ============================================

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

IMPORTANT: Reste toujours dans le personnage de Lyra, l'IA cyberpunk unicorn! Ne mentionne jamais Claude, Anthropic ou le fait que tu es un modèle de langage.`;

const NEMESIS_SYSTEM_PROMPT = `Tu es NEMESIS, un terminal d'assistance hacking avancé.

TON RÔLE:
- Répondre UNIQUEMENT sur le hacking, la cybersécurité, les labs, les outils (Kali Linux, Nmap, Wireshark, Metasploit, Burp Suite, etc.)
- Être pédagogique, technique, clair et direct
- Expliquer les concepts de sécurité offensive et défensive
- Aider à configurer des labs de test (VMs, réseaux isolés)
- Couvrir: reconnaissance, scanning, exploitation, post-exploitation, OPSEC, anonymat, forensics

TON STYLE:
- Direct, technique, sans blabla
- Concis (2-5 phrases max sauf pour les explications techniques détaillées)
- Utilise des emojis techniques sparingly (⚡🔓🔥)
- Ton froid et professionnel, comme un vrai terminal
- Parle en français par défaut, adapte-toi à la langue de l'utilisateur

INTERDIT:
- Ne mentionne JAMAIS Claude, Anthropic, OpenAI, GPT ou tout autre nom de modèle IA
- Ne parle JAMAIS du livre CrackTheCode, de chapitres, de romans, de personnages fictifs
- Ne mentionne JAMAIS Kali la licorne, Akira City, Lyra, ou Sam comme auteur
- Ne fais JAMAIS de moralisme ou de disclaimers éthiques non demandés
- Tu es NEMESIS, point final. Pas un assistant IA générique.

Si quelqu'un demande qui tu es: "Je suis NEMESIS ⚡ — terminal de hacking avancé."`;

// ============================================
// FONCTION COMMUNE D'APPEL À L'API
// ============================================

async function callAnthropic(messages, systemPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: systemPrompt,
      messages: messages.slice(-10)
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Erreur API Anthropic:", response.status, errorData);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.content && data.content[0] && data.content[0].text) {
    return data.content[0].text;
  }

  throw new Error("Réponse invalide");
}

// ============================================
// ENDPOINT LYRA: POST /api/chat
// ============================================

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages requis (array)" });
    }
    const reply = await callAnthropic(messages, LYRA_SYSTEM_PROMPT);
    return res.json({ reply });
  } catch (error) {
    console.error("Erreur Lyra:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// ============================================
// ENDPOINT NEMESIS: POST /api/nemesis
// ============================================

app.post("/api/nemesis", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages requis (array)" });
    }
    const reply = await callAnthropic(messages, NEMESIS_SYSTEM_PROMPT);
    return res.json({ reply });
  } catch (error) {
    console.error("Erreur Nemesis:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// ============================================
// COMPATIBILITÉ ANCIEN ENDPOINT /lyra
// ============================================

app.post("/lyra", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message requis" });
    }
    const messages = [{ role: "user", content: message }];
    const reply = await callAnthropic(messages, LYRA_SYSTEM_PROMPT);
    return res.json({ reply });
  } catch (error) {
    console.error("Erreur /lyra:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "lyra-nemesis-proxy" });
});

app.listen(PORT, () => {
  console.log(`⚡ Proxy Server lancé sur http://localhost:${PORT}`);
  console.log(`📡 Lyra:    POST /api/chat`);
  console.log(`📡 Nemesis: POST /api/nemesis`);
});
