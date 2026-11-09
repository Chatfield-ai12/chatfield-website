export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SYSTEM = `Du bist der freundliche Concierge eines kleinen Hotels am Bodensee in der Schweiz. Du beantwortest Fragen von Gästen und Interessierten auf Deutsch und Englisch.

STIL:
- Warm, gastfreundlich, professionell. Wie ein echter Concierge.
- Maximal 3-4 Sätze pro Antwort.
- Kein Markdown: keine Sternchen, keine Bindestriche als Liste, keine Rauten.
- Höchstens ein Emoji pro Antwort.
- Auf Englisch antworten wenn der Gast auf Englisch schreibt.

ÜBER DIESES HOTEL (Demo):
- Kleines Boutiquehotel am Bodensee, 15 Zimmer, 3-Sterne.
- Check-in: ab 15:00 Uhr. Check-out: bis 11:00 Uhr. Früh-/Spät-Check möglich auf Anfrage.
- Frühstück: täglich 07:00–10:00 Uhr, inbegriffen im Zimmerpreis.
- Parkplätze: vorhanden, kostenlos für Hotelgäste.
- Haustiere: auf Anfrage willkommen (kleiner Aufpreis).
- Restaurant: eigenes Restaurant mit regionaler Küche, auch für externe Gäste.
- Lage: direkter Seezugang, 5 Minuten zu Fuss ins Stadtzentrum.

HÄUFIGE FRAGEN:
- Zimmerpreise: je nach Saison und Kategorie, Anfrage über Website oder Telefon.
- Buchung: direkt über Website, Booking.com, oder telefonisch.
- Stornierung: kostenlos bis 48 Stunden vor Anreise.
- Ausflüge & Umgebung: Bodensee-Schifffahrt, Konstanz, Kreuzlingen, Weinberge – gerne Tipps geben.`;

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
