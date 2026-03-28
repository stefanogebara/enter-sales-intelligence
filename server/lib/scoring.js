/**
 * Composite Labor Litigation Risk Score
 *
 * Score = Volume (30%) + Complexity (40%) + Timing (30%)
 *
 * Data sources:
 *  - CNJ Justiça em Números 2025 (year-base 2024)
 *  - TST Relatório Geral / Ranking das Partes
 *  - DIEESE Desempenho dos Bancos 2023
 *  - CAGED/RAIS sector turnover data
 *  - IMF WP 2025/063 — Labor Litigation and Productivity in Brazil
 *
 * Key national stats (2024-2025):
 *  - 2.4M new 1st-instance labor cases/year
 *  - R$50.6B total paid by employers (2025, record)
 *  - 79-88% employee success rate (partial + full + settlement)
 *  - Average settlement: ~R$24,000
 *  - Top 100 companies: avg 4,315 cases each (13.6% of all cases)
 */

// Sector turnover rates (annual, Brazil)
// Sources: DIEESE 2023, CAGED PDET, IMF WP 2025/063
// Banking: 57.8% of separations employer-initiated (DIEESE)
// Call centers: 30-45% annual, 13-15% monthly in SP (DIEESE/academic)
// National average: 51.3% (CAGED 2024)
const SECTOR_TURNOVER = {
  financial_services: 0.25, // gross: 36k admissions + 42k separations on 280k base (DIEESE)
  tech: 0.20,
  retail: 0.35,             // highest business mortality rate (30.2%), "temporary passage" employment
  airlines: 0.15,           // Azul pilot attrition 5.2% YTD 2025; ground crew higher
  telecom: 0.18,            // consolidation-driven (Oi bankruptcy, TIM/Vivo restructuring)
  healthcare: 0.20,         // nursing/technical roles, 12x36 shifts
  utilities: 0.10,          // low for own employees, high for outsourced (not counted here)
  services: 0.40,           // facilities/call center: among highest in Brazil
};

// Sector risk multiplier vs national average
// Source: IMF WP 2025/063, MPT data, TST sector distribution
// National: ~1 case per 29 employees. Banking: ~1 per 2 employees (TST/Anamatra)
// CNJ 2024 sector share: Services 27.9%, Industry 20.6%, Commerce 13.1%
const SECTOR_RISK_MULTIPLIER = {
  financial_services: 12,  // 1 case per 2 employees (TST/MPT data)
  tech: 2,                 // mostly white-collar, lower claim frequency
  retail: 5,               // 1 case per 8-23 employees (MPT)
  airlines: 8,             // complex aviation law, strong unions, regulated schedules
  telecom: 5,              // outsourcing liability, restructuring waves
  healthcare: 4,           // insalubridade (+1,092% at TST 2024), shift disputes
  utilities: 4,            // periculosidade (30% premium), field work hazards
  services: 10,            // call centers #1 for TST individual claim volume
};

// Estimated labor cases per 1,000 employees/year by sector
// Derived from: TST ranking, CNJ sector distribution, DIEESE data
// Banking: 4.3M total accumulated cases across 450-500k employees (Febraban)
// National new cases: 2.4M/year across ~45M formal workers ≈ 53 per 1,000
const CNJ_SECTOR_BENCHMARK = {
  financial_services: 18,   // banking: ~500 per 1,000 accumulated; ~18/1,000/year new
  tech: 3.5,
  retail: 8.5,
  airlines: 12,
  telecom: 7,
  healthcare: 5,
  utilities: 4,
  services: 15,             // call center/facilities: highest individual claim frequency
};

// Average cost per labor case (BRL) by sector
// Source: TST 2025 — R$50.6B / 2.3M cases ≈ R$22,000 blended average
// Banking sector: higher (overtime 7th/8th hour, moral damages)
// Call center: lower per case but very high volume
const AVG_CASE_COST_BRL = {
  financial_services: 35000,  // overtime 7th/8th hour + moral damages
  tech: 28000,
  retail: 22000,              // severance disputes, overtime
  airlines: 45000,            // complex crew schedule disputes, higher salaries
  telecom: 30000,             // outsourcing liability chains
  healthcare: 28000,          // insalubridade + shift disputes
  utilities: 38000,           // periculosidade premium + field accidents
  services: 18000,            // high volume but lower per-case value
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function normalize(val, min, max) {
  if (max === min) return 0;
  return clamp(((val - min) / (max - min)) * 100, 0, 100);
}

export function calculateScore(company) {
  const turnover = SECTOR_TURNOVER[company.sector] || 0.20;
  const riskMult = SECTOR_RISK_MULTIPLIER[company.sector] || 3;
  const cnjRate = CNJ_SECTOR_BENCHMARK[company.sector] || 5.0;
  const avgCaseCost = AVG_CASE_COST_BRL[company.sector] || 25000;

  // --- Volume (30%) ---
  const annualSeparations = company.employees * turnover;
  const estimatedCases = (company.employees / 1000) * cnjRate;
  const estimatedAnnualCost = estimatedCases * avgCaseCost;
  // Volume: log scale normalized. 100 = 50k+ employees with high turnover
  const volumeRaw = normalize(Math.log10(annualSeparations + 1), 1, 4.5);

  // --- Complexity (40%) ---
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
  const timingFactors = {
    recentLayoffs: company.recentLayoffs || 0,
    mAndA: company.mAndA || 0,
    restructuring: company.restructuring || 0,
    privatization: company.privatization || 0,
  };
  const timingMax = Math.max(...Object.values(timingFactors));
  const timingAvg =
    Object.values(timingFactors).reduce((a, b) => a + b, 0) / 4;
  const timingRaw = normalize(timingMax * 0.7 + timingAvg * 0.3, 0, 10);

  // --- Composite ---
  const total = Math.round(volumeRaw * 0.3 + complexityRaw * 0.4 + timingRaw * 0.3);

  let verdict;
  if (total >= 65) verdict = 'QUALIFIED';
  else if (total >= 40) verdict = 'POTENTIAL';
  else verdict = 'NOT_QUALIFIED';

  // Estimated ARR: Enter charges ~R$1,500/case managed (LPO benchmark)
  // For qualification threshold: $500k/year ≈ R$2.75M
  const estimatedARR_BRL = estimatedCases * 1500;
  const estimatedARR = Math.round(estimatedARR_BRL / 5.5); // USD

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
    sectorRiskMultiplier: riskMult,
    complexityFactors,
    timingFactors,
  };
}

export { SECTOR_TURNOVER, SECTOR_RISK_MULTIPLIER, CNJ_SECTOR_BENCHMARK, AVG_CASE_COST_BRL };
