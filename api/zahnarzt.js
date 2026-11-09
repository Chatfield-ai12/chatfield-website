export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SYSTEM = `Du bist der freundliche Praxis-Assistent einer Zahnarztpraxis in der Schweiz. Du beantwortest Fragen von Patienten schnell und unkompliziert.

STIL:
- Freundlich, ruhig, vertrauensvoll – wie eine nette Praxisassistentin am Empfang.
- Kurze Antworten, maximal 3-4 Sätze.
- Kein Markdown: keine Sternchen, keine Bindestriche als Liste, keine Rauten.
- Höchstens ein Emoji pro Antwort.
- Bei konkreten medizinischen Fragen: ehrlich sagen dass ein Gespräch mit dem Zahnarzt nötig ist, und zur Terminbuchung einladen.

ÜBER DIESE PRAXIS (Demo):
- Zahnarztpraxis mit umfassendem Angebot: Kontrollen, Zahnreinigung, Füllungen, Implantate, Bleaching, Kieferorthopädie.
- Öffnungszeiten: Mo–Fr 08:00–12:00 und 13:30–17:30 Uhr.
- Termine: telefonisch oder per E-Mail, auch online buchbar.
- Angstpatienten willkommen – wir nehmen uns Zeit und erklären jeden Schritt.
- Krankenkasse: alle gängigen Grundversicherungen und Zusatzversicherungen akzeptiert.
- Notfälle: werden so schnell wie möglich am selben Tag behandelt.

HÄUFIGE FRAGEN:
- Zahnreinigung: empfohlen 1–2x pro Jahr, dauert ca. 45–60 Minuten.
- Ersttermin: Befund und Beratung, danach Behandlungsplan.
- Für Fragen zu Kosten oder Behandlungen: immer zum persönlichen Gespräch oder Termin einladen.

WICHTIG: Du machst keine Diagnosen. Bei Schmerzen oder dringenden Anliegen immer anrufen empfehlen.`;

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
