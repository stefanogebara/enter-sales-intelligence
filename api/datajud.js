/**
 * DataJud CNJ — Jurimetria: Real labor case statistics.
 * Public API, 237M+ lawsuits, free.
 *
 * Returns aggregate data: top case subjects, yearly trends,
 * total volume across major TRT regions.
 */

const DATAJUD_URL = 'https://api-publica.datajud.cnj.jus.br';
const DATAJUD_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

async function queryTRT(trt) {
  try {
    const res = await fetch(`${DATAJUD_URL}/api_publica_${trt}/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `APIKey ${DATAJUD_KEY}`,
      },
      body: JSON.stringify({
        size: 0,
        aggs: {
          top_subjects: {
            terms: { field: 'assuntos.nome.keyword', size: 10 },
          },
          cases_by_year: {
            date_histogram: { field: 'dataAjuizamento', calendar_interval: 'year' },
          },
          by_class: {
            terms: { field: 'classe.nome.keyword', size: 5 },
          },
        },
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { region } = req.body;
  const trt = region || 'trt2'; // Default to TRT2 (São Paulo, largest)

  try {
    const data = await queryTRT(trt);
    if (!data) return res.status(502).json({ error: 'DataJud indisponível' });

    const totalCases = data.hits?.total?.value || 0;

    const topSubjects = (data.aggregations?.top_subjects?.buckets || []).map((b) => ({
      name: b.key,
      count: b.doc_count,
    }));

    const yearlyTrend = (data.aggregations?.cases_by_year?.buckets || [])
      .filter((b) => b.doc_count > 0)
      .slice(-6)
      .map((b) => ({
        year: new Date(b.key_as_string).getFullYear(),
        cases: b.doc_count,
      }));

    const caseTypes = (data.aggregations?.by_class?.buckets || []).map((b) => ({
      name: b.key,
      count: b.doc_count,
    }));

    res.json({
      region: trt.toUpperCase(),
      totalCases,
      topSubjects,
      yearlyTrend,
      caseTypes,
      source: 'DataJud/CNJ — API Pública (datajud.cnj.jus.br)',
      apiKey: 'Public (published by CNJ)',
    });
  } catch (err) {
    console.error('datajud error:', err.message);
    res.status(500).json({ error: 'Falha ao consultar DataJud.' });
  }
}

export const config = { maxDuration: 20 };
