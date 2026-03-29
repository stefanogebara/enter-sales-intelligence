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

// POST /api/qualify — deep qualification via Claude + web search
router.post('/qualify', async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!validateCompanyId(companyId)) return res.status(400).json({ error: 'companyId inválido' });

    const company = getCompanyById(companyId);
    if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

    const cacheKey = `${companyId}:qualify`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ text: cached, cached: true });

    const enriched = { ...company, score: calculateScore(company) };
    const { system, user } = qualificationPrompt(enriched);
    const text = await callClaude(system, user);

    setCache(cacheKey, text);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
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
