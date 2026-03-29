import { Router } from 'express';
import { companies, getCompanyById } from '../lib/companies.js';
import { calculateScore } from '../lib/scoring.js';
import { callWithSearch, callGenerate, callClaude } from '../lib/claude.js';
import { qualificationPrompt, discoveryPrompt, pitchPrompt } from '../lib/prompts.js';

const router = Router();

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
    if (!companyId) return res.status(400).json({ error: 'companyId required' });

    const company = getCompanyById(companyId);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const cacheKey = `${companyId}:qualify`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ text: cached, cached: true });

    const enriched = { ...company, score: calculateScore(company) };
    const { system, user } = qualificationPrompt(enriched);
    const text = await callClaude(system, user);

    setCache(cacheKey, text);
    res.json({ text });
  } catch (err) {
    const message = err.name === 'AbortError'
      ? 'Análise excedeu o tempo limite de 75 segundos. Tente novamente.'
      : err.message;
    res.status(500).json({ error: message });
  }
});

// POST /api/discovery — generate discovery questions
router.post('/discovery', async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!companyId) return res.status(400).json({ error: 'companyId required' });

    const company = getCompanyById(companyId);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const cacheKey = `${companyId}:discovery`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ text: cached, cached: true });

    // Use qualification data if available
    const qualData = getCached(`${companyId}:qualify`) || '';
    const enriched = { ...company, score: calculateScore(company) };
    const { system, user } = discoveryPrompt(enriched, qualData);
    const text = await callGenerate(system, user);  // Claude Sonnet — no web search needed

    setCache(cacheKey, text);
    res.json({ text });
  } catch (err) {
    const message = err.name === 'AbortError'
      ? 'Geração excedeu o tempo limite. Tente novamente.'
      : err.message;
    res.status(500).json({ error: message });
  }
});

// POST /api/pitch — generate CFO pitch
router.post('/pitch', async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!companyId) return res.status(400).json({ error: 'companyId required' });

    const company = getCompanyById(companyId);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const cacheKey = `${companyId}:pitch`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ text: cached, cached: true });

    const qualData = getCached(`${companyId}:qualify`) || '';
    const enriched = { ...company, score: calculateScore(company) };
    const { system, user } = pitchPrompt(enriched, qualData);
    const text = await callGenerate(system, user);  // Claude Sonnet — no web search needed

    setCache(cacheKey, text);
    res.json({ text });
  } catch (err) {
    const message = err.name === 'AbortError'
      ? 'Geração excedeu o tempo limite. Tente novamente.'
      : err.message;
    res.status(500).json({ error: message });
  }
});

// POST /api/warm — pre-warm cache for top N companies (for demo)
router.post('/warm', async (req, res) => {
  const { count = 3 } = req.body;
  const scored = companies
    .map((c) => ({ ...c, score: calculateScore(c) }))
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, count);

  res.json({ message: `Warming ${scored.length} companies...`, companies: scored.map((c) => c.name) });

  // Run in background (response already sent)
  for (const company of scored) {
    const cacheKey = `${company.id}:qualify`;
    if (getCached(cacheKey)) continue;
    try {
      const { system, user } = qualificationPrompt(company);
      const text = await callClaude(system, user);
      setCache(cacheKey, text);
      console.log(`Warmed: ${company.name} (qualify)`);
    } catch (err) {
      console.error(`Warm failed for ${company.name}:`, err.message);
    }
    // 3s delay between calls to avoid rate limiting
    await new Promise((r) => setTimeout(r, 3000));
  }
});

// GET /api/cache/status — check what's cached (for demo)
router.get('/cache/status', (_req, res) => {
  const entries = [];
  for (const [key, val] of cache.entries()) {
    entries.push({ key, age: Math.round((Date.now() - val.timestamp) / 1000) });
  }
  res.json({ entries, total: entries.length });
});

export default router;
