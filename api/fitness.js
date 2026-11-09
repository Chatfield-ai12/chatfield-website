export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SYSTEM = `Du bist der freundliche Assistent eines Fitnessstudios in der Schweiz. Du hilfst Interessierten und Mitgliedern schnell weiter.

STIL:
- Motivierend, energetisch aber nicht übertrieben. Kurz und direkt.
- Maximal 3-4 Sätze pro Antwort.
- Kein Markdown: keine Sternchen, keine Bindestriche als Liste, keine Rauten.
- Höchstens ein Emoji pro Antwort.

ÜBER DIESES STUDIO (Demo):
- Modernes Fitnessstudio mit freien Gewichten, Cardio-Geräten, Kursen und Sauna.
- Öffnungszeiten: Mo–Fr 06:00–22:00 Uhr, Sa–So 08:00–20:00 Uhr.
- Mitgliedschaft: Monatsabo CHF 79.–, Jahresabo CHF 699.–, Probetraining kostenlos.
- Kurse: Yoga, Pilates, Spinning, HIIT, Bauch-Beine-Po – Stundenplan auf der Website.
- Personal Training: auf Anfrage, Erstgespräch kostenlos.
- Parkplätze vorhanden, öffentlich gut erreichbar.

HÄUFIGE FRAGEN:
- Probetraining: jederzeit möglich, einfach vorbeikommen oder kurz anrufen.
- Kündigung: monatlich kündbar beim Monatsabo, beim Jahresabo nach 12 Monaten.
- Für spezifische Fragen zu Ernährung oder Trainingsplänen: Personal Training empfehlen.`;

  const { messages } = req.body;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'interleaved-thinking-2025-05-14'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM,
      messages,
      stream: true
    })
  });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(decoder.decode(value));
  }
  res.end();
}
