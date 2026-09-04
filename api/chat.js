export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SYSTEM = `Du bist der Assistent von Chatfield. Antworte sachlich, kurz und ohne Emojis. Maximal 3 Sätze. Keine Floskeln wie "Gerne!" oder "Super Frage!". Direkt auf die Frage antworten, Sie-Form.

ÜBER CHATFIELD:
- Schweizer Startup von Lev Hasler und Lino Olimpio, Kanton Thurgau
- Wir bauen KI-Chatbots für KMUs die Kundenfragen automatisch beantworten, 24/7
- Website: chatfield-ai.ch | Email: lev@chatfield-ai.ch

PREISE:
- Starter: CHF 99/Monat + CHF 500 Einrichtung
- Professional: CHF 149/Monat + CHF 800 Einrichtung
- Pilot: 3 KMUs können aktuell kostenlos testen, 30 Tage, kein Vertrag

BRANCHEN: Fitnessstudios, Coiffeure, Garagen, Hotels, Beauty Studios, Fahrschulen`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      stream: true,
      system: SYSTEM,
      messages: req.body.messages
    })
  });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(decoder.decode(value));
  }
  res.end();
}
