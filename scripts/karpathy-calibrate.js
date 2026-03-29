/**
 * Karpathy Loop: Calibrate scoring model with real data.
 *
 * For each top company, uses Perplexity Sonar Pro to search for:
 * 1. Real number of labor lawsuits (processos trabalhistas)
 * 2. Provisão trabalhista from balance sheet (public companies)
 * 3. Recent news about labor disputes
 *
 * Then compares found data vs our pre-loaded estimates and outputs
 * a calibration report.
 *
 * Usage: node scripts/karpathy-calibrate.js [count]
 */

import 'dotenv/config';
import { companies } from '../server/lib/companies.js';
import { calculateScore } from '../server/lib/scoring.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'perplexity/sonar-pro';

async function searchCompanyData(company) {
  const score = calculateScore(company);

  const prompt = `Pesquise dados REAIS e RECENTES sobre processos trabalhistas da empresa "${company.name}" no Brasil.

Preciso dos seguintes dados CONCRETOS (se não encontrar, diga "NÃO ENCONTRADO"):

1. PROCESSOS_ATIVOS: Quantos processos trabalhistas ativos a empresa tem? (busque no TST Ranking das Partes, CNJ, notícias)
2. NOVOS_CASOS_ANO: Quantos novos processos trabalhistas por ano? (dados mais recentes)
3. PROVISAO_TRABALHISTA_BRL: Valor da provisão trabalhista no balanço (empresas de capital aberto — busque nos resultados trimestrais ou anuais mais recentes)
4. FUNCIONARIOS_REAL: Número real de funcionários mais recente
5. LAYOFFS_RECENTES: Demissões em massa nos últimos 2 anos (com números)
6. CUSTO_MEDIO_CASO: Se disponível, custo médio por processo trabalhista
7. SINDICATO_ATIVO: Nome do(s) sindicato(s) e nível de atividade recente
8. FONTE_PRINCIPAL: A fonte mais confiável que você encontrou

IMPORTANTE: Cite as fontes com URLs. Prefira dados do TST, CNJ, CVM, relatórios anuais.

Responda em formato estruturado, um item por linha. Seja ESPECÍFICO com números.`;

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://enter-sales-intelligence.local',
      'X-Title': 'Enter Karpathy Calibration',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: 'Você é um analista de dados jurídicos brasileiro. Retorne apenas dados factuais com fontes. Se não encontrar um dado, diga NÃO ENCONTRADO.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const usage = data.usage || {};

  return { text, tokens: usage.total_tokens || 0 };
}

// --- Main ---
const count = parseInt(process.argv[2]) || 10;
const scored = companies
  .map((c) => ({ ...c, score: calculateScore(c) }))
  .sort((a, b) => b.score.total - a.score.total)
  .slice(0, count);

console.log(`\n=== KARPATHY CALIBRATION LOOP ===`);
console.log(`Searching real data for top ${count} companies...\n`);

const results = [];
let totalTokens = 0;

for (const company of scored) {
  const score = company.score;
  console.log(`--- ${company.name} (Score: ${score.total}, Est. Cases: ${score.estimatedCases}) ---`);

  try {
    const { text, tokens } = await searchCompanyData(company);
    totalTokens += tokens;

    console.log(text.substring(0, 800));
    console.log('...\n');

    results.push({
      id: company.id,
      name: company.name,
      ourEstimate: {
        employees: company.employees,
        estimatedCases: score.estimatedCases,
        estimatedCostBRL: score.estimatedAnnualCostBRL,
        score: score.total,
        verdict: score.verdict,
      },
      realData: text,
    });

    // 2s delay between calls
    await new Promise((r) => setTimeout(r, 2000));
  } catch (err) {
    console.error(`  ERROR: ${err.message}\n`);
    results.push({ id: company.id, name: company.name, error: err.message });
  }
}

// --- Summary ---
console.log('\n=== CALIBRATION SUMMARY ===\n');
console.log(`Companies analyzed: ${results.length}`);
console.log(`Total tokens used: ${totalTokens.toLocaleString()}`);
console.log(`Estimated cost: ~$${(totalTokens * 0.000003).toFixed(4)}\n`);

console.log('Our estimates vs reality (check the output above for discrepancies):');
for (const r of results) {
  if (r.error) {
    console.log(`  ${r.name}: ERROR - ${r.error}`);
  } else {
    console.log(`  ${r.name}: Score ${r.ourEstimate.score} | Est. ${r.ourEstimate.estimatedCases} cases | ${r.ourEstimate.verdict}`);
  }
}

// Save results
import { writeFileSync } from 'fs';
const outPath = 'tasks/calibration-results.json';
writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`\nFull results saved to: ${outPath}`);
