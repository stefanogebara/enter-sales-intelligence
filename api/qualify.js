import { companies } from '../server/lib/companies.js';
import { calculateScore } from '../server/lib/scoring.js';
import { qualificationPrompt } from '../server/lib/prompts.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { companyId } = req.body;
  if (!companyId || typeof companyId !== 'string' || !/^[a-z0-9-]+$/.test(companyId)) {
    return res.status(400).json({ error: 'companyId inválido' });
  }

  const company = companies.find((c) => c.id === companyId);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

  try {
    const enriched = { ...company, score: calculateScore(company) };
    const { system, user } = qualificationPrompt(enriched);

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://enter-sales-intelligence.vercel.app',
        'X-Title': 'Enter Sales Intelligence',
      },
      body: JSON.stringify({
        model: 'perplexity/sonar-pro',
        max_tokens: 4096,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: AbortSignal.timeout(85000),
    });

    if (!response.ok) throw new Error(`OpenRouter ${response.status}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    res.json({ text });
  } catch (err) {
    console.error('qualify error:', err.message);
    res.status(500).json({ error: 'Falha na análise. Tente novamente.' });
  }
}

export const config = { maxDuration: 90 };
