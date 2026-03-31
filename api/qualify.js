import { companies } from '../server/lib/companies.js';
import { calculateScore } from '../server/lib/scoring.js';
import { qualificationPrompt } from '../server/lib/prompts.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function extractMetrics(qualText) {
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `Extract key metrics from this qualification analysis. Return ONLY valid JSON, no other text. If a value is not found, use null.

Format:
{"employees":number,"glassdoorRating":number,"recentLayoffs":number,"unionDispute":boolean,"restructuring":boolean,"casesPerYear":number,"annualCostBRL":number,"turnoverPct":number}`,
          },
          { role: 'user', content: qualText },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
}

function enrichScore(company, baseScore, metrics) {
  if (!metrics) return null;

  let adjustment = 0;

  // Glassdoor: low rating = higher risk
  if (metrics.glassdoorRating != null) {
    if (metrics.glassdoorRating < 3.0) adjustment += 5;
    else if (metrics.glassdoorRating < 3.5) adjustment += 2;
    else if (metrics.glassdoorRating >= 4.2) adjustment -= 3;
  }

  // Real employee count vs our estimate
  if (metrics.employees != null && metrics.employees > 0) {
    const ratio = metrics.employees / company.employees;
    if (ratio > 1.2) adjustment += 3;     // more employees than we thought
    else if (ratio < 0.8) adjustment -= 3; // fewer
  }

  // Real layoffs found
  if (metrics.recentLayoffs != null && metrics.recentLayoffs > 500) {
    adjustment += 4;
  }

  // Real cases per year vs estimate
  if (metrics.casesPerYear != null && metrics.casesPerYear > 0) {
    const ratio = metrics.casesPerYear / baseScore.estimatedCases;
    if (ratio > 1.5) adjustment += 5;      // way more cases than estimated
    else if (ratio > 1.1) adjustment += 2;
    else if (ratio < 0.5) adjustment -= 4; // way fewer
  }

  // Union dispute confirmed
  if (metrics.unionDispute === true && !company.unionDispute) {
    adjustment += 3;
  }

  const enrichedTotal = Math.max(0, Math.min(100, baseScore.total + adjustment));

  let verdict;
  if (enrichedTotal >= 65) verdict = 'QUALIFIED';
  else if (enrichedTotal >= 40) verdict = 'POTENTIAL';
  else verdict = 'NOT_QUALIFIED';

  return {
    total: enrichedTotal,
    baseTotal: baseScore.total,
    adjustment,
    verdict,
    metrics,
    factors: [
      metrics.glassdoorRating != null ? `Glassdoor ${metrics.glassdoorRating}/5` : null,
      metrics.employees != null ? `${metrics.employees.toLocaleString()} func. (real)` : null,
      metrics.recentLayoffs != null ? `${metrics.recentLayoffs.toLocaleString()} demissões recentes` : null,
      metrics.casesPerYear != null ? `${metrics.casesPerYear.toLocaleString()} casos/ano (real)` : null,
      metrics.unionDispute ? 'Disputa sindical confirmada' : null,
    ].filter(Boolean),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { companyId } = req.body;
  if (!companyId || typeof companyId !== 'string' || !/^[a-z0-9-]+$/.test(companyId)) {
    return res.status(400).json({ error: 'companyId inválido' });
  }

  const company = companies.find((c) => c.id === companyId);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

  try {
    const baseScore = calculateScore(company);
    const enriched = { ...company, score: baseScore };
    const { system, user } = qualificationPrompt(enriched);

    // Step 1: Qualification via Perplexity
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

    // Step 2: Extract metrics and enrich score (fast, parallel-safe)
    const metrics = await extractMetrics(text);
    const enrichedScore = enrichScore(company, baseScore, metrics);

    res.json({ text, enrichedScore });
  } catch (err) {
    console.error('qualify error:', err.message);
    res.status(500).json({ error: 'Falha na análise. Tente novamente.' });
  }
}

export const config = { maxDuration: 90 };
