import { Router } from 'express';
import { companies, getCompanyById } from '../lib/companies.js';
import { calculateScore } from '../lib/scoring.js';
import { callGenerate, callClaude } from '../lib/claude.js';
import { qualificationPrompt, discoveryPrompt, pitchPrompt } from '../lib/prompts.js';

const router = Router();

// Validate companyId: must be lowercase alphanumeric + hyphens only
function validateCompanyId(id) {
  return typeof id === 'string' && /^[a-z0-9-]+$/.test(id) && id.length < 50;
}

// Sanitize error messages — never expose internal details to client
function safeErrorMessage(err) {
  if (err.name === 'AbortError') return 'Análise excedeu o tempo limite. Tente novamente.';
  console.error('API error:', err.message);
  return 'Falha na análise. Tente novamente.';
}

// In-memory cache: { [companyId:type]: { text, timestamp } }
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.text;
  return null;
}

function setCache(key, text) {
  cache.set(key, { text, timestamp: Date.now() });
}

// GET /api/companies — all companies with pre-calculated scores
router.get('/companies', (_req, res) => {
  const scored = companies.map((c) => ({
    ...c,
    score: calculateScore(c),
  }));
  scored.sort((a, b) => b.score.total - a.score.total);
  res.json(scored);
});

// GET /api/companies/:id — single company with score
router.get('/companies/:id', (req, res) => {
  const company = getCompanyById(req.params.id);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json({ ...company, score: calculateScore(company) });
});

// Extract structured metrics from qualification text via Haiku
async function extractMetrics(qualText) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku', max_tokens: 500,
        messages: [
          { role: 'system', content: 'Extract metrics from this analysis. Return ONLY valid JSON.\nFormat: {"employees":number,"glassdoorRating":number,"recentLayoffs":number,"unionDispute":boolean,"restructuring":boolean,"casesPerYear":number,"annualCostBRL":number,"turnoverPct":number}\nUse null if not found.' },
          { role: 'user', content: qualText },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const m = raw.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch { return null; }
}

function enrichScore(company, baseScore, metrics) {
  if (!metrics) return null;
  let adj = 0;
  if (metrics.glassdoorRating != null) { if (metrics.glassdoorRating < 3.0) adj += 5; else if (metrics.glassdoorRating < 3.5) adj += 2; else if (metrics.glassdoorRating >= 4.2) adj -= 3; }
  if (metrics.employees != null && metrics.employees > 0) { const r = metrics.employees / company.employees; if (r > 1.2) adj += 3; else if (r < 0.8) adj -= 3; }
  if (metrics.recentLayoffs != null && metrics.recentLayoffs > 500) adj += 4;
  if (metrics.casesPerYear != null && metrics.casesPerYear > 0) { const r = metrics.casesPerYear / baseScore.estimatedCases; if (r > 1.5) adj += 5; else if (r > 1.1) adj += 2; else if (r < 0.5) adj -= 4; }
  if (metrics.unionDispute === true && !company.unionDispute) adj += 3;
  const total = Math.max(0, Math.min(100, baseScore.total + adj));
  let verdict; if (total >= 65) verdict = 'QUALIFIED'; else if (total >= 40) verdict = 'POTENTIAL'; else verdict = 'NOT_QUALIFIED';
  return {
    total, baseTotal: baseScore.total, adjustment: adj, verdict, metrics,
    factors: [
      metrics.glassdoorRating != null ? `Glassdoor ${metrics.glassdoorRating}/5` : null,
      metrics.employees != null ? `${metrics.employees.toLocaleString()} func. (real)` : null,
      metrics.recentLayoffs != null ? `${metrics.recentLayoffs.toLocaleString()} demissões` : null,
      metrics.casesPerYear != null ? `${metrics.casesPerYear.toLocaleString()} casos/ano (real)` : null,
      metrics.unionDispute ? 'Disputa sindical confirmada' : null,
    ].filter(Boolean),
  };
}

// POST /api/qualify — deep qualification + score enrichment
router.post('/qualify', async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!validateCompanyId(companyId)) return res.status(400).json({ error: 'companyId inválido' });

    const company = getCompanyById(companyId);
    if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

    const cacheKey = `${companyId}:qualify`;
    const cached = getCached(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.json(parsed);
    }

    const baseScore = calculateScore(company);
    const enriched = { ...company, score: baseScore };
    const { system, user } = qualificationPrompt(enriched);
    const text = await callClaude(system, user);

    // Extract metrics and enrich score
    const metrics = await extractMetrics(text);
    const enrichedScore = enrichScore(company, baseScore, metrics);

    const result = { text, enrichedScore };
    setCache(cacheKey, JSON.stringify(result));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

// POST /api/datajud — real CNJ judicial data
router.post('/datajud', async (req, res) => {
  const trt = req.body.region || 'trt2';
  try {
    const r = await fetch(`https://api-publica.datajud.cnj.jus.br/api_publica_${trt}/_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==' },
      body: JSON.stringify({ size: 0, aggs: {
        top_subjects: { terms: { field: 'assuntos.nome.keyword', size: 10 } },
        cases_by_year: { date_histogram: { field: 'dataAjuizamento', calendar_interval: 'year' } },
        by_class: { terms: { field: 'classe.nome.keyword', size: 5 } },
      }}),
      signal: AbortSignal.timeout(25000),
    });
    if (!r.ok) return res.status(502).json({ error: 'DataJud indisponível' });
    const data = await r.json();
    res.json({
      region: trt.toUpperCase(),
      totalCases: data.hits?.total?.value || 0,
      topSubjects: (data.aggregations?.top_subjects?.buckets || []).map(b => ({ name: b.key, count: b.doc_count })),
      yearlyTrend: (data.aggregations?.cases_by_year?.buckets || []).filter(b => b.doc_count > 0).slice(-6).map(b => ({ year: new Date(b.key_as_string).getFullYear(), cases: b.doc_count })),
      caseTypes: (data.aggregations?.by_class?.buckets || []).map(b => ({ name: b.key, count: b.doc_count })),
      source: 'DataJud/CNJ — API Pública',
    });
  } catch { res.status(500).json({ error: 'DataJud timeout' }); }
});

// POST /api/discovery — generate discovery questions
router.post('/discovery', async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!validateCompanyId(companyId)) return res.status(400).json({ error: 'companyId inválido' });

    const company = getCompanyById(companyId);
    if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

    const cacheKey = `${companyId}:discovery`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ text: cached, cached: true });

    const qualData = getCached(`${companyId}:qualify`) || '';
    const enriched = { ...company, score: calculateScore(company) };
    const { system, user } = discoveryPrompt(enriched, qualData);
    const text = await callGenerate(system, user);

    setCache(cacheKey, text);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

// POST /api/pitch — generate CFO pitch
router.post('/pitch', async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!validateCompanyId(companyId)) return res.status(400).json({ error: 'companyId inválido' });

    const company = getCompanyById(companyId);
    if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

    const cacheKey = `${companyId}:pitch`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ text: cached, cached: true });

    const qualData = getCached(`${companyId}:qualify`) || '';
    const enriched = { ...company, score: calculateScore(company) };
    const { system, user } = pitchPrompt(enriched, qualData);
    const text = await callGenerate(system, user);

    setCache(cacheKey, text);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

// POST /api/simulate — multi-stakeholder simulation v2 (Round 1 + Round 2 + Synthesis)
router.post('/simulate', async (req, res) => {
  const { companyId } = req.body;
  if (!validateCompanyId(companyId)) return res.status(400).json({ error: 'companyId inválido' });

  const company = getCompanyById(companyId);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

  const cacheKey = `${companyId}:simulate`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  const score = calculateScore(company);
  const context = `Empresa: ${company.name} (${company.segment})\nFuncionários: ${company.employees.toLocaleString()}\nSede: ${company.headquarters}\nScore: ${score.total}/100 (${score.verdict})\nCasos estimados/ano: ~${score.estimatedCases.toLocaleString()}\nCusto estimado: R$${(score.estimatedAnnualCostBRL / 1e6).toFixed(0)}M/ano\n${company.notes || ''}`;

  const personas = [
    { id: 'cfo', title: 'CFO', label: 'CFO', color: '#3B82F6', prompt: 'Você é o CFO. Analise da perspectiva FINANCEIRA em 3-4 frases.' },
    { id: 'clo', title: 'Diretor Jurídico', label: 'CLO', color: '#FFAE35', prompt: 'Você é o CLO. Analise da perspectiva JURÍDICA em 3-4 frases.' },
    { id: 'chro', title: 'Diretor de RH', label: 'CHRO', color: '#22C55E', prompt: 'Você é o CHRO. Analise da perspectiva de PESSOAS em 3-4 frases.' },
    { id: 'union', title: 'Líder Sindical', label: 'SIND', color: '#EF4444', prompt: 'Você é o líder sindical. Analise da perspectiva dos TRABALHADORES em 3-4 frases.' },
    { id: 'board', title: 'Membro do Conselho', label: 'BOARD', color: '#A855F7', prompt: 'Você é membro do conselho. Analise da perspectiva ESTRATÉGICA em 3-4 frases.' },
  ];

  const OR = 'https://openrouter.ai/api/v1/chat/completions';
  const hdr = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` };
  const ask = async (model, sys, usr) => {
    const r = await fetch(OR, { method: 'POST', headers: hdr, body: JSON.stringify({ model, max_tokens: model.includes('haiku') ? 300 : 600, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }] }) });
    if (!r.ok) throw new Error(`LLM ${r.status}`);
    return (await r.json()).choices?.[0]?.message?.content || '';
  };

  try {
    // Round 1
    const round1 = await Promise.all(personas.map(async (p) => ({
      ...p, text: await ask('anthropic/claude-3.5-haiku', `${p.prompt}\nPortuguês do Brasil. Máximo 4 frases.`, context),
    })));

    // Round 2: reactions
    const round2 = await Promise.all(round1.map(async (p) => {
      const others = round1.filter(o => o.id !== p.id).map(o => `[${o.title}]: ${o.text}`).join('\n\n');
      const reaction = await ask('anthropic/claude-3.5-haiku',
        `Você é o ${p.title}. Ouviu os outros stakeholders. Em 1-2 frases, reaja: concorda, discorda, ou adiciona algo? Português do Brasil.`,
        `Sua análise:\n${p.text}\n\nOutros:\n${others}`);
      return { ...p, reaction };
    }));

    // Synthesis
    const allText = round1.map(p => `[${p.title}]: ${p.text}`).join('\n\n');
    const synthesis = await ask('anthropic/claude-sonnet-4-6',
      'Analise 5 perspectivas. Retorne em PT-BR:\n## Consenso\n[1-2 frases]\n## Conflitos\n[1-2 frases]\n## Urgência\n[1 frase + score 1-10]',
      allText);

    const result = {
      company: company.name,
      personas: round2.map(p => ({ id: p.id, title: p.title, label: p.label, color: p.color, text: p.text, reaction: p.reaction })),
      synthesis,
    };
    setCache(cacheKey, JSON.stringify(result));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

// POST /api/warm — pre-warm cache (localhost only, capped at 5)
router.post('/warm', (req, res) => {
  const host = req.hostname || req.headers.host;
  if (!host?.includes('localhost')) return res.status(403).json({ error: 'Forbidden' });

  const n = Math.max(1, Math.min(parseInt(req.body.count, 10) || 3, 5));
  const scored = companies
    .map((c) => ({ ...c, score: calculateScore(c) }))
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, n);

  res.json({ message: `Warming ${scored.length} companies...`, companies: scored.map((c) => c.name) });

  (async () => {
    for (const company of scored) {
      const cacheKey = `${company.id}:qualify`;
      if (getCached(cacheKey)) continue;
      try {
        const { system, user } = qualificationPrompt(company);
        const text = await callClaude(system, user);
        setCache(cacheKey, text);
      } catch (_) { /* logged by safeErrorMessage internally */ }
      await new Promise((r) => setTimeout(r, 3000));
    }
  })();
});

// GET /api/cache/status — localhost only
router.get('/cache/status', (req, res) => {
  const host = req.hostname || req.headers.host;
  if (!host?.includes('localhost')) return res.status(403).json({ error: 'Forbidden' });
  const entries = [];
  for (const [key, val] of cache.entries()) {
    entries.push({ key, age: Math.round((Date.now() - val.timestamp) / 1000) });
  }
  res.json({ entries, total: entries.length });
});

export default router;
