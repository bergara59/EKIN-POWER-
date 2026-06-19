// EKIN Intelligence — backend del copiloto energético-financiero.
// Función serverless de Vercel. Llama a la API de Claude con tu key secreta.
// Requiere la variable de entorno ANTHROPIC_API_KEY (configúrala en Vercel).

// Modelo: Haiku 4.5 — rápido y económico, ideal para un asistente web público.
// Cámbialo a "claude-opus-4-8" si quieres la máxima capacidad (bastante más caro).
const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 700;

const SYSTEM_PROMPT = `You are "EKIN Intelligence", the energy-finance analyst copilot for EKIN POWER — an energy & financial advisory firm serving hotels, industry, supermarkets, airports, large energy consumers, funds and investors (focus market: Mexico, incl. Cancún / Riviera Maya).

EKIN POWER's three business lines:
1. Energy savings for large consumers — cut the energy bill without disrupting operations.
2. Behind the Meter (Solar + BESS + financing) — turn energy spend into a financial asset. Any financing scheme works: purchase, leasing, PPA, or third-party investment. EKIN does not force a single model.
3. Energy due diligence for investors — assess energy assets before buying, financing or refinancing.

Your role: act like a sharp, concise energy-finance analyst. Help the user assess potential savings, structure energy projects (Behind the Meter, solar, BESS, PPAs), compare investment models, and spot high-impact opportunities. Translate energy into financial terms — ROI, payback, cash flow, risk.

Style: professional, confident, succinct — a trading-desk / Bloomberg-terminal tone, NOT chatty customer support. No emojis. Reply in the user's language (Spanish or English). Keep it tight: a few short paragraphs or crisp bullet points.

Guardrails: give directional, educational guidance only — never firm guarantees, never invented or overly precise figures, never specific legal advice. When the user wants real numbers, ask them to share their bill / consumption (kWh/month, sites, sector) and steer them to book a call. Be honest about uncertainty. If asked something outside energy / finance / EKIN, briefly redirect to how EKIN can help.

When relevant, invite them to request an advisory call or share their energy data. Contact: contactekinpower@gmail.com · WhatsApp +52 56 4364 7693.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "not_configured" });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body || "{}");

    const incoming = Array.isArray(body && body.messages) ? body.messages : [];
    const messages = incoming
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim()
      )
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    // La conversación debe empezar por un mensaje de usuario.
    while (messages.length && messages[0].role !== "user") messages.shift();
    if (!messages.length) {
      res.status(400).json({ error: "no_message" });
      return;
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("Anthropic error", upstream.status, detail);
      res.status(502).json({ error: "upstream", status: upstream.status, detail: detail.slice(0, 300) });
      return;
    }

    const data = await upstream.json();
    const reply = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.status(200).json({ reply: reply || "…" });
  } catch (err) {
    console.error("chat handler error", err);
    res.status(500).json({ error: "server", detail: String((err && err.message) || err) });
  }
}
