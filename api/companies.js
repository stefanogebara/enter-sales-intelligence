import { companies } from '../server/lib/companies.js';
import { calculateScore } from '../server/lib/scoring.js';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const scored = companies
      .map((c) => ({ ...c, score: calculateScore(c) }))
      .sort((a, b) => b.score.total - a.score.total);
    return res.json(scored);
  }

  // GET /api/companies/[id]
  const id = req.query.id;
  if (id) {
    const company = companies.find((c) => c.id === id);
    if (!company) return res.status(404).json({ error: 'Not found' });
    return res.json({ ...company, score: calculateScore(company) });
  }

  res.json(companies.map((c) => ({ ...c, score: calculateScore(c) })).sort((a, b) => b.score.total - a.score.total));
}
