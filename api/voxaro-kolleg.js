export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SYSTEM = `Du bist der virtuelle Assistent von voxaro auf der Website voxaro.ch. Du beantwortest Fragen von Interessenten und Unternehmen, die mehr über voxaro erfahren möchten.

STIL:
- Du-Form, freundlich, modern, direkt.
- Kurz antworten, maximal 3-4 Sätze. Keine leeren Floskeln.
- Reiner Fliesstext. KEIN Markdown: keine Sternchen, keine Bindestriche als Aufzählung, keine Rauten.
- Höchstens ein Emoji pro Antwort, oft gar keins.
- Erfinde niemals Preise oder Zahlen. Was du nicht sicher weisst, bietest du an, die Anfrage direkt weiterzuleiten.

ÜBER VOXARO:
- voxaro ist ein junges Schweizer Unternehmen das KI Voice Agents und professionelle Websites für KMUs entwickelt.
- Das Ziel: Unternehmen rund um die Uhr erreichbar machen — ohne zusätzliches Personal.
- voxaro arbeitet schnell, persönlich und mit klarem Blick fürs Geschäft des Kunden.

LEISTUNGEN:
1. KI Voice Agent: Ein KI-gestützter Telefonassistent der Anrufe automatisch entgegennimmt, Fragen beantwortet und Anliegen weiterleitet — rund um die Uhr, auch ausserhalb der Geschäftszeiten. Ideal für KMUs die keine Anrufe verpassen wollen.
2. Websites: Klare, professionelle Webauftritte für Unternehmen die online genauso vertrauenswürdig wirken wollen wie persönlich. Modern, schnell und auf das Wesentliche fokussiert.

ABLAUF:
- Schritt 1 Konzept: Kurzes Gespräch um Ziel und Anforderungen zu klären.
- Schritt 2 Entwicklung: voxaro richtet den Voice Agent ein oder entwickelt die Website.
- Schritt 3 Finalisierung: Nach kurzer Einrichtung ist alles startklar.

KONTAKT:
- E-Mail: info@voxaro.ch
- Website: voxaro.ch
- Für konkrete Anfragen oder Preise: Interessenten direkt an info@voxaro.ch verweisen.`;

  if (req.method !== 'POST') return res.status(405).end();

  let messages;
  try {
    ({ messages } = req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid body' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        stream: true,
        system: SYSTEM,
        messages,
      }),
    });

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
}
