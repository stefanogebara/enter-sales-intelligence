/**
 * Research Findings — Key data points for the Enter Sales Intelligence case.
 * This file serves as a reference for the presentation.
 * Data from: CNJ, TST, DIEESE, IMF, CVM filings, union sources.
 */

export const ENTER_FACTS = {
  company: {
    founded: 2023,
    previousName: 'Talisman AI',
    valuation: 'R$2B (~$350M)',
    funding: '$35M Series A (Sep 2025)',
    investors: ['Founders Fund (Peter Thiel)', 'Sequoia Capital'],
    ceo: 'Mateus Costa-Ribeiro — youngest Brazilian attorney at 18, Harvard Law LL.M., NY Bar at 20',
    cto: 'Michael Mac-Vicar — co-founded Wildlife Studios ($4B gaming unicorn)',
    cpo: 'Henrique Vaz — Harvard CS, 20+ Math/Informatics Olympiad medals',
    security: ['SOC 2', 'ISO 27001', 'ISO 27701', 'LGPD', 'OpenAI ZDR'],
    results: {
      bmg: '+7% win rate on 5,000+ AI-drafted defenses',
      latam: '+30% win rate in consumer lawsuits',
      sulamerica: '30,000 cases analyzed from 500,000 documents',
    },
  },

  market: {
    newCasesPerYear: '2.4M (1st instance, 2024)',
    totalPaidByEmployers: 'R$50.6B (2025, all-time record)',
    employeeSuccessRate: '79-88%',
    avgSettlement: '~R$24,000 (2023)',
    top100Companies: 'avg 4,315 cases each (13.6% of all cases)',
    reform2017Impact: '-31% initial drop, but recovered +14% YoY by 2024',
    bankingSectorProvisions: '~R$80B across major banks',
    bankingAccumulatedCases: '4.3M total',
    growthTrajectory: 'R$29B (2020) → R$50.6B (2025) = +74% in 4 years',
  },

  sectorRisk: {
    banking: { multiplier: '12x', casesPerK: 18, topClaims: '7th/8th hour overtime, abusive targets, union disputes' },
    callCenter: { multiplier: '10x', casesPerK: 15, topClaims: 'DORT/LER, turnover 40%/yr, monitoring abuse' },
    airlines: { multiplier: '8x', casesPerK: 12, topClaims: 'Aeronaut law schedule violations, union strikes' },
    retail: { multiplier: '5x', casesPerK: 8.5, topClaims: 'Sunday/holiday work, overtime, commissions' },
    telecom: { multiplier: '5x', casesPerK: 7, topClaims: 'Outsourcing subsidiary liability, targets' },
    healthcare: { multiplier: '4x', casesPerK: 5, topClaims: 'Insalubridade (+1,092% TST 2024), shifts' },
    utilities: { multiplier: '4x', casesPerK: 4, topClaims: 'Periculosidade 30%, privatization waves' },
    tech: { multiplier: '2x', casesPerK: 3.5, topClaims: 'Pejotização, mass layoffs' },
  },

  cfoAngles: [
    'Provisioning accuracy (CPC 25/IAS 37): over-provisioning distorts EBITDA, pressures covenants',
    'Cost predictability: from variable law firm billing to per-case fixed pricing',
    'Cost reduction: 30-60% vs traditional firms (documented by Enter clients)',
    'Resolution speed: faster = less provisioning duration = capital freed',
    'Trajectory worsening: R$50.6B (2025) vs R$29B (2020) = +74% in 4 years',
  ],

  competitors: {
    directEnterprise: 'Enter is largely alone at this tier',
    eLaw: 'Process management, not AI-native litigation execution',
    mol: 'Mediation/settlement only, complementary',
    projuris: 'Case tracking CRM, does not do legal work',
    justto: '94% settlement prediction accuracy, but not full defense',
    analytics: 'Predictus, DataLawyer, DeepLegal — analytics only',
  },
};
