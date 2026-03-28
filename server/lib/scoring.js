/**
 * Composite Labor Litigation Risk Score
 *
 * Score = Volume (30%) + Complexity (40%) + Timing (30%)
 *
 * Volume:    employees × sector turnover rate → normalized 0-100
 * Complexity: cargo diversity + multi-state + unions + operational ratio + seniority variance
 * Timing:    recent layoffs + M&A + restructuring + privatization
 */

// Sector turnover rates (annual, Brazil) — source: DIEESE/CAGED estimates
const SECTOR_TURNOVER = {
  financial_services: 0.12,
  tech: 0.18,
  retail: 0.30,
  airlines: 0.15,
  telecom: 0.14,
  healthcare: 0.16,
  utilities: 0.08,
  services: 0.35,
};

// CNJ benchmark: labor cases per 1,000 employees/year by sector
const CNJ_SECTOR_BENCHMARK = {
  financial_services: 3.2,
  tech: 1.8,
  retail: 4.5,
  airlines: 5.1,
  telecom: 3.8,
  healthcare: 2.9,
  utilities: 2.1,
  services: 6.2,
};

// Average cost per labor case (BRL) by sector
const AVG_CASE_COST_BRL = {
  financial_services: 45000,
  tech: 38000,
  retail: 28000,
  airlines: 52000,
  telecom: 35000,
  healthcare: 32000,
  utilities: 40000,
  services: 22000,
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function normalize(val, min, max) {
  if (max === min) return 0;
  return clamp(((val - min) / (max - min)) * 100, 0, 100);
}

export function calculateScore(company) {
  const turnover = SECTOR_TURNOVER[company.sector] || 0.15;
  const cnjRate = CNJ_SECTOR_BENCHMARK[company.sector] || 3.0;
  const avgCaseCost = AVG_CASE_COST_BRL[company.sector] || 35000;

  // --- Volume (30%) ---
  // Annual separations estimate
  const annualSeparations = company.employees * turnover;
  // Estimated annual new labor cases
  const estimatedCases = (company.employees / 1000) * cnjRate;
  // Estimated annual litigation cost (BRL)
  const estimatedAnnualCost = estimatedCases * avgCaseCost;
  // Volume raw score: normalize on log scale (100 = 50k+ employees with high turnover)
  const volumeRaw = normalize(Math.log10(annualSeparations + 1), 1, 4.5);

  // --- Complexity (40%) ---
  // Each sub-factor is 0-10, combined and normalized to 0-100
  const complexityFactors = {
    cargoDiversity: company.cargoDiversity || 5,
    multiState: company.multiState || 5,
    unionActivity: company.unionActivity || 5,
    operationalRatio: (company.operationalRatio || 0.5) * 10,
    seniorityVariance: company.seniorityVariance || 5,
  };
  const complexitySum = Object.values(complexityFactors).reduce((a, b) => a + b, 0);
  const complexityRaw = normalize(complexitySum, 0, 50);

  // --- Timing (30%) ---
  // Each trigger is 0-10, take weighted max (most relevant trigger dominates)
  const timingFactors = {
    recentLayoffs: company.recentLayoffs || 0,
    mAndA: company.mAndA || 0,
    restructuring: company.restructuring || 0,
    privatization: company.privatization || 0,
  };
  const timingMax = Math.max(...Object.values(timingFactors));
  const timingAvg =
    Object.values(timingFactors).reduce((a, b) => a + b, 0) /
    Object.values(timingFactors).length;
  // Weighted: 70% max trigger + 30% average (one big event matters most)
  const timingRaw = normalize(timingMax * 0.7 + timingAvg * 0.3, 0, 10) ;

  // --- Composite ---
  const total = Math.round(volumeRaw * 0.3 + complexityRaw * 0.4 + timingRaw * 0.3);

  // Qualification verdict
  let verdict;
  if (total >= 65) verdict = 'QUALIFIED';
  else if (total >= 40) verdict = 'POTENTIAL';
  else verdict = 'NOT_QUALIFIED';

  // Estimated ARR potential (USD) — rough: Enter charges ~$X per case managed
  // If cost per case externally is avgCaseCost, Enter might save 30% → their fee is ~30% of total
  const estimatedARR = Math.round((estimatedAnnualCost * 0.3) / 5.5); // BRL to USD rough

  return {
    total,
    volume: Math.round(volumeRaw),
    complexity: Math.round(complexityRaw),
    timing: Math.round(timingRaw),
    verdict,
    estimatedCases: Math.round(estimatedCases),
    estimatedAnnualCostBRL: Math.round(estimatedAnnualCost),
    estimatedARR,
    annualSeparations: Math.round(annualSeparations),
    turnoverRate: turnover,
    cnjRate,
    avgCaseCost,
    complexityFactors,
    timingFactors,
  };
}

export { SECTOR_TURNOVER, CNJ_SECTOR_BENCHMARK, AVG_CASE_COST_BRL };
