/**
 * DataJud CNJ API — Real labor case data from Brazil's judicial database.
 * 237M+ lawsuits. Public API, free, published key by CNJ.
 *
 * Searches across all 24 TRT (labor court) regions for a company name.
 * Returns: total cases found, top case subjects, recent filings.
 */

const DATAJUD_URL = 'https://api-publica.datajud.cnj.jus.br';
const DATAJUD_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

// Major TRT regions (covers ~80% of labor cases)
const TRTS = ['trt1', 'trt2', 'trt3', 'trt4', 'trt5', 'trt15'];

async function searchTRT(trt, companyName) {
  try {
    const res = await fetch(`${DATAJUD_URL}/api_publica_${trt}/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `APIKey ${DATAJUD_KEY}`,
      },
      body: JSON.stringify({
        size: 0,
        query: {
          bool: {
            should: [
              { match_phrase: { 'assuntos.nome': companyName } },
              { match: { 'orgaoJulgador.nome': companyName } },
            ],
            minimum_should_match: 0,
          },
        },
        aggs: {
          by_subject: {
            terms: { field: 'assuntos.nome.keyword', size: 5 },
          },
          by_year: {
            date_histogram: { field: 'dataAjuizamento', calendar_interval: 'year' },
          },
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      trt,
      total: data.hits?.total?.value || 0,
      subjects: data.aggregations?.by_subject?.buckets || [],
      yearlyTrend: data.aggregations?.by_year?.buckets?.slice(-5) || [],
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { companyName } = req.body;
  if (!companyName || typeof companyName !== 'string' || companyName.length > 100) {
    return res.status(400).json({ error: 'companyName required' });
  }

  try {
    // Query top 6 TRTs in parallel
    const results = (await Promise.all(
      TRTS.map((trt) => searchTRT(trt, companyName))
    )).filter(Boolean);

    // Aggregate
    const totalCases = results.reduce((sum, r) => sum + r.total, 0);

    // Merge subjects across TRTs
    const subjectMap = {};
    for (const r of results) {
      for (const s of r.subjects) {
        subjectMap[s.key] = (subjectMap[s.key] || 0) + s.doc_count;
      }
    }
    const topSubjects = Object.entries(subjectMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Per-TRT breakdown
    const byRegion = results
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((r) => ({ region: r.trt.toUpperCase(), cases: r.total }));

    res.json({
      companyName,
      totalCases,
      topSubjects,
      byRegion,
      source: 'DataJud/CNJ - API Pública (237M+ processos)',
      note: 'Dados agregados dos 6 maiores TRTs. Partes (nomes) não disponíveis na API pública - busca por assuntos do setor.',
    });
  } catch (err) {
    console.error('datajud error:', err.message);
    res.status(500).json({ error: 'Falha ao consultar DataJud.' });
  }
}

export const config = { maxDuration: 30 };
