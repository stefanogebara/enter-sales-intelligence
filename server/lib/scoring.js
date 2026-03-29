/**
 * Composite Labor Litigation Risk Score — v2 (Karpathy-calibrated)
 *
 * Score = Volume (30%) + Complexity (40%) + Timing (30%)
 *
 * CALIBRATED WITH REAL DATA:
 *  - TST Ranking das Partes (Fev/2026): Bradesco 716/mês, Itaú 600/mês, Santander 588/mês
 *  - Vivo: 12,000 casos/ano (~1,000/mês) — Revista Veja
 *  - Bradesco: 48,192 casos em 5 anos (Berton Bortolotto/jurimetria)
 *  - Magalu: R$173M provisão trabalhista (Formulário Referência 2025)
 *  - CNJ 2025: 2.4M novos/ano, R$50.6B pagos
 *
 * METHODOLOGY:
 *  TST ranking shows cases at supreme labor court level only.
 *  Total cases across all instances ≈ TST × 5-10x.
 *  We use "cases per 1,000 employees per year" anchored on real data.
 */

// Calibrated sector litigation rates (cases/1,000 employees/year, ALL instances)
// Anchor: Bradesco ~9,600/yr ÷ 84k = 114/1k; Vivo 12,000/yr ÷ 33k = 364/1k
// These include cases where company is defendant as tomadora (outsourcing)
const SECTOR_LITIGATION_RATE = {
  financial_services: 100,  // Bradesco: 114, Itaú: 75 (TST level), avg ~100
  tech: 8,                  // low volume, mostly white-collar
  retail: 25,               // high turnover but lower per-capita than banks
  airlines: 35,             // complex aviation law, strong unions
  telecom: 200,             // VERY HIGH — outsourcing subsidiária inflates (Vivo: 366)
  healthcare: 20,           // insalubridade claims rising fast (+1,092% TST 2024)
  utilities: 15,            // periculosidade, lower volume than telecom
  services: 50,             // call center + facilities: high volume, lower value
};

// Sector turnover rates — DIEESE/CAGED
const SECTOR_TURNOVER = {
  financial_services: 0.25,
  tech: 0.20,
  retail: 0.35,
  airlines: 0.15,
  telecom: 0.18,
  healthcare: 0.20,
  utilities: 0.10,
  services: 0.40,
};

// Average cost per case (BRL) — derived from R$50.6B / 2.4M national avg = R$21k
const AVG_CASE_COST_BRL = {
  financial_services: 30000,
  tech: 25000,
  retail: 18000,
  airlines: 40000,
  telecom: 22000,
  healthcare: 25000,
  utilities: 35000,
  services: 15000,
};

// Sector complexity defaults (verifiable from CNJ/TST sector analysis)
// Reflects: regulatory burden, CLT claim diversity, typical operational complexity
const SECTOR_COMPLEXITY = {
  financial_services: 8,  // 7th/8th hour, metas abusivas, cargo de confiança, multiple CLT categories
  tech: 4,                // mostly white-collar, fewer CLT categories
  retail: 6,              // Sunday work, shift schedules, commission disputes
  airlines: 9,            // Aeronauts law, crew scheduling, multi-category workforce
  telecom: 7,             // outsourcing chains, field technicians, pejotização
  healthcare: 8,          // insalubridade, shift (12x36), multiple professional categories
  utilities: 7,           // periculosidade, field work, privatization legacy
  services: 6,            // high volume but standardized claims (overtime, DORT)
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function norm(v, lo, hi) { return hi === lo ? 0 : clamp(((v - lo) / (hi - lo)) * 100, 0, 100); }

export function calculateScore(company) {
  const litRate = SECTOR_LITIGATION_RATE[company.sector] || 25;
  const turnover = SECTOR_TURNOVER[company.sector] || 0.20;
  const avgCost = AVG_CASE_COST_BRL[company.sector] || 22000;

  // --- Volume (30%) ---
  const estimatedCases = Math.round((company.employees / 1000) * litRate);
  const estimatedAnnualCost = estimatedCases * avgCost;
  const annualSeparations = Math.round(company.employees * turnover);

  // Log scale: 10 cases = low, 10,000+ = max
  const volumeRaw = norm(Math.log10(Math.max(estimatedCases, 1)), 1, 4);

  // --- Complexity (40%) ---
  // Redesigned to use VERIFIABLE indicators only:
  //   statesCount (0-27)     → from LinkedIn/CVM/annual reports
  //   unionDispute (boolean) → from union websites, news (Contraf-CUT, SNA, etc.)
  //   outsourcingRisk (bool) → sector-based: telecom, utilities, facilities = true
  //   publicCompany (bool)   → verifiable via B3/NASDAQ listing
  //   sectorComplexity (0-10)→ sector default from CNJ/TST data (not per-company)
  const statesScore = clamp((company.statesCount || company.states?.length || 5) / 27 * 10, 0, 10);
  const unionScore = company.unionDispute ? 8 : (company.unionActivity || 4);
  const outsourcingScore = company.outsourcingRisk ? 8 : 3;
  const publicScore = company.publicCompany ? 6 : 3;
  const sectorCx = SECTOR_COMPLEXITY[company.sector] || 5;

  const complexityFactors = {
    presencaEstadual: Math.round(statesScore * 10) / 10,
    atividadeSindical: unionScore,
    riscoTerceirizacao: outsourcingScore,
    empresaAberta: publicScore,
    complexidadeSetor: sectorCx,
  };
  const complexitySum = Object.values(complexityFactors).reduce((a, b) => a + b, 0);
  const complexityRaw = norm(complexitySum, 0, 50);

  // --- Timing (30%) ---
  const timingFactors = {
    recentLayoffs: company.recentLayoffs || 0,
    mAndA: company.mAndA || 0,
    restructuring: company.restructuring || 0,
    privatization: company.privatization || 0,
  };
  const tmMax = Math.max(...Object.values(timingFactors));
  const tmAvg = Object.values(timingFactors).reduce((a, b) => a + b, 0) / 4;
  const timingRaw = norm(tmMax * 0.7 + tmAvg * 0.3, 0, 10);

  // --- Composite ---
  const total = Math.round(volumeRaw * 0.3 + complexityRaw * 0.4 + timingRaw * 0.3);

  let verdict;
  if (total >= 65) verdict = 'QUALIFIED';
  else if (total >= 40) verdict = 'POTENTIAL';
  else verdict = 'NOT_QUALIFIED';

  // ARR estimate: Enter avg contract ~R$4M (from investor data, ~15 clients ÷ ~R$60M ARR)
  // Simplified: R$1,500/case managed (LPO benchmark)
  // Qualification threshold: US$500k ≈ R$2.75M → need ~1,833 cases
  const estimatedARR_BRL = estimatedCases * 1500;
  const estimatedARR = Math.round(estimatedARR_BRL / 5.5);
  const meetsARRThreshold = estimatedARR >= 500000;

  return {
    total,
    volume: Math.round(volumeRaw),
    complexity: Math.round(complexityRaw),
    timing: Math.round(timingRaw),
    verdict,
    estimatedCases,
    estimatedAnnualCostBRL: Math.round(estimatedAnnualCost),
    estimatedARR,
    meetsARRThreshold,
    annualSeparations,
    turnoverRate: turnover,
    litigationRate: litRate,
    avgCaseCost: avgCost,
    complexityFactors,
    timingFactors,
  };
}

export { SECTOR_LITIGATION_RATE, SECTOR_TURNOVER, AVG_CASE_COST_BRL };
