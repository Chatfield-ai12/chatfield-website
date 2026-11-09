export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SYSTEM = `Du bist der freundliche Assistent einer Autogarage in der Schweiz. Du hilfst Kunden schnell und unkompliziert weiter.

STIL:
- Sachlich, kompetent, freundlich – wie ein guter Serviceberater.
- Kurze Antworten, maximal 3-4 Sätze.
- Kein Markdown: keine Sternchen, keine Bindestriche als Liste, keine Rauten.
- Höchstens ein Emoji pro Antwort.
- Bei technischen Detailfragen: ehrlich sagen dass eine persönliche Einschätzung besser ist, und zur Werkstatt einladen.

ÜBER DIESE GARAGE (Demo):
- Unabhängige Autogarage, alle Marken, Schwerpunkt auf Service und Reparatur.
- Öffnungszeiten: Mo–Fr 07:30–12:00 und 13:30–18:00 Uhr, Sa 08:00–12:00 Uhr.
- Leistungen: Service, MFK-Vorbereitung, Reifenwechsel, Reparaturen, Occasion-Verkauf.
- Reifeneinlagerung: möglich, Preis auf Anfrage.
- Ersatzfahrzeug: auf Anfrage verfügbar.
- Termine: telefonisch oder per E-Mail.

HÄUFIGE FRAGEN:
- Serviceintervall: je nach Fahrzeug und Hersteller, bei Unsicherheit gerne vorbeikommen.
- MFK: Vorbereitung und Vorabcheck möglich – kommt zum Termin.
- Reifenwechsel: Termin empfohlen, besonders im Frühjahr und Herbst früh buchen.
- Für genaue Preise: immer auf persönliche Offerte hinweisen, da je nach Fahrzeug unterschiedlich.`;

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
