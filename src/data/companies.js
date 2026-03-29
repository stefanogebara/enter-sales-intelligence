/**
 * Client-side company data with pre-calculated scores.
 * This is a static snapshot so the dashboard renders instantly without API calls.
 * Deep analysis via Claude API will override these with real-time data.
 */

// Mirrors server/lib/scoring.js v2 (Karpathy-calibrated with TST Ranking data)
const SECTOR_LIT_RATE = {
  financial_services: 100, tech: 8, retail: 25,
  airlines: 35, telecom: 200, healthcare: 20,
  utilities: 15, services: 50,
};
const SECTOR_TURNOVER = {
  financial_services: 0.25, tech: 0.20, retail: 0.35,
  airlines: 0.15, telecom: 0.18, healthcare: 0.20,
  utilities: 0.10, services: 0.40,
};
const AVG_CASE_COST = {
  financial_services: 30000, tech: 25000, retail: 18000,
  airlines: 40000, telecom: 22000, healthcare: 25000,
  utilities: 35000, services: 15000,
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function norm(v, lo, hi) { return hi === lo ? 0 : clamp(((v - lo) / (hi - lo)) * 100, 0, 100); }

function calcScore(c) {
  const litR = SECTOR_LIT_RATE[c.sector] || 25;
  const t = SECTOR_TURNOVER[c.sector] || 0.20;
  const avgC = AVG_CASE_COST[c.sector] || 22000;
  const cases = Math.round((c.employees / 1000) * litR);
  const annCost = cases * avgC;
  const sep = Math.round(c.employees * t);
  const volRaw = norm(Math.log10(Math.max(cases, 1)), 1, 4);
  const cxFactors = {
    cargoDiversity: c.cargoDiversity || 5,
    multiState: c.multiState || 5,
    unionActivity: c.unionActivity || 5,
    operationalRatio: (c.operationalRatio || 0.5) * 10,
    seniorityVariance: c.seniorityVariance || 5,
  };
  const cxSum = Object.values(cxFactors).reduce((a, b) => a + b, 0);
  const cxRaw = norm(cxSum, 0, 50);
  const tmFactors = {
    recentLayoffs: c.recentLayoffs || 0,
    mAndA: c.mAndA || 0,
    restructuring: c.restructuring || 0,
    privatization: c.privatization || 0,
  };
  const tmMax = Math.max(...Object.values(tmFactors));
  const tmAvg = Object.values(tmFactors).reduce((a, b) => a + b, 0) / 4;
  const tmRaw = norm(tmMax * 0.7 + tmAvg * 0.3, 0, 10);
  const total = Math.round(volRaw * 0.3 + cxRaw * 0.4 + tmRaw * 0.3);
  let verdict;
  if (total >= 65) verdict = 'QUALIFIED';
  else if (total >= 40) verdict = 'POTENTIAL';
  else verdict = 'NOT_QUALIFIED';
  const estARR = Math.round((cases * 1500) / 5.5);
  return {
    total, volume: Math.round(volRaw), complexity: Math.round(cxRaw),
    timing: Math.round(tmRaw), verdict,
    estimatedCases: cases,
    estimatedAnnualCostBRL: annCost,
    estimatedARR: estARR,
    meetsARRThreshold: estARR >= 500000,
    annualSeparations: sep,
    turnoverRate: t, litigationRate: litR, avgCaseCost: avgC,
    complexityFactors: cxFactors, timingFactors: tmFactors,
  };
}

const rawCompanies = [
  { id:'itau',name:'Itaú Unibanco',sector:'financial_services',segment:'Financial Services',employees:96219,headquarters:'São Paulo, SP',cargoDiversity:9,multiState:10,unionActivity:9,operationalRatio:0.50,seniorityVariance:9,recentLayoffs:8,mAndA:7,restructuring:7,privatization:0 },
  { id:'bradesco',name:'Bradesco',sector:'financial_services',segment:'Financial Services',employees:84022,headquarters:'Osasco, SP',cargoDiversity:9,multiState:10,unionActivity:9,operationalRatio:0.50,seniorityVariance:9,recentLayoffs:8,mAndA:5,restructuring:9,privatization:0 },
  { id:'hapvida',name:'Hapvida',sector:'healthcare',segment:'Healthcare',employees:69000,headquarters:'Fortaleza, CE',cargoDiversity:10,multiState:10,unionActivity:8,operationalRatio:0.80,seniorityVariance:7,recentLayoffs:5,mAndA:10,restructuring:9,privatization:0 },
  { id:'santander',name:'Santander Brasil',sector:'financial_services',segment:'Financial Services',employees:55646,headquarters:'São Paulo, SP',cargoDiversity:8,multiState:10,unionActivity:10,operationalRatio:0.55,seniorityVariance:8,recentLayoffs:6,mAndA:3,restructuring:6,privatization:0 },
  { id:'verzani-sandrini',name:'Verzani & Sandrini',sector:'services',segment:'Services',employees:45000,headquarters:'São Paulo, SP',cargoDiversity:6,multiState:10,unionActivity:6,operationalRatio:0.90,seniorityVariance:5,recentLayoffs:3,mAndA:4,restructuring:3,privatization:0 },
  { id:'aec',name:'AeC',sector:'services',segment:'Services',employees:30000,headquarters:'Belo Horizonte, MG',cargoDiversity:4,multiState:8,unionActivity:6,operationalRatio:0.90,seniorityVariance:3,recentLayoffs:5,mAndA:3,restructuring:4,privatization:0 },
  { id:'mercado-livre',name:'Mercado Livre',sector:'retail',segment:'Retail',employees:33000,headquarters:'São Paulo, SP',cargoDiversity:9,multiState:10,unionActivity:7,operationalRatio:0.60,seniorityVariance:6,recentLayoffs:5,mAndA:4,restructuring:4,privatization:0 },
  { id:'vivo',name:'Vivo (Telefônica Brasil)',sector:'telecom',segment:'Telecom',employees:32728,headquarters:'São Paulo, SP',cargoDiversity:8,multiState:10,unionActivity:8,operationalRatio:0.55,seniorityVariance:8,recentLayoffs:5,mAndA:7,restructuring:6,privatization:4 },
  { id:'magalu',name:'Magazine Luiza',sector:'retail',segment:'Retail',employees:37000,headquarters:'Franca, SP',cargoDiversity:8,multiState:10,unionActivity:6,operationalRatio:0.75,seniorityVariance:7,recentLayoffs:5,mAndA:5,restructuring:5,privatization:0 },
  { id:'latam',name:'LATAM Airlines Brasil',sector:'airlines',segment:'Airlines',employees:22500,headquarters:'São Paulo, SP',cargoDiversity:9,multiState:10,unionActivity:10,operationalRatio:0.75,seniorityVariance:8,recentLayoffs:7,mAndA:6,restructuring:8,privatization:0 },
  { id:'energisa',name:'Energisa',sector:'utilities',segment:'Utilities',employees:18000,headquarters:'Cataguases, MG',cargoDiversity:7,multiState:10,unionActivity:7,operationalRatio:0.70,seniorityVariance:7,recentLayoffs:3,mAndA:8,restructuring:4,privatization:5 },
  { id:'azul',name:'Azul Linhas Aéreas',sector:'airlines',segment:'Airlines',employees:15400,headquarters:'Barueri, SP',cargoDiversity:8,multiState:10,unionActivity:10,operationalRatio:0.75,seniorityVariance:7,recentLayoffs:9,mAndA:3,restructuring:10,privatization:0 },
  { id:'tim',name:'TIM Brasil',sector:'telecom',segment:'Telecom',employees:10000,headquarters:'Rio de Janeiro, RJ',cargoDiversity:7,multiState:10,unionActivity:7,operationalRatio:0.50,seniorityVariance:7,recentLayoffs:4,mAndA:8,restructuring:5,privatization:0 },
  { id:'nubank',name:'Nubank',sector:'financial_services',segment:'Financial Services',employees:8716,headquarters:'São Paulo, SP',cargoDiversity:6,multiState:5,unionActivity:5,operationalRatio:0.30,seniorityVariance:4,recentLayoffs:7,mAndA:2,restructuring:5,privatization:0 },
  { id:'uol',name:'UOL (PagSeguro/PagBank)',sector:'financial_services',segment:'Financial Services',employees:7000,headquarters:'São Paulo, SP',cargoDiversity:6,multiState:6,unionActivity:3,operationalRatio:0.40,seniorityVariance:4,recentLayoffs:5,mAndA:4,restructuring:5,privatization:0 },
  { id:'ifood',name:'iFood',sector:'retail',segment:'Retail',employees:6000,headquarters:'São Paulo, SP',cargoDiversity:6,multiState:9,unionActivity:4,operationalRatio:0.30,seniorityVariance:3,recentLayoffs:7,mAndA:3,restructuring:5,privatization:0 },
  { id:'c6bank',name:'C6 Bank',sector:'financial_services',segment:'Financial Services',employees:5500,headquarters:'São Paulo, SP',cargoDiversity:5,multiState:3,unionActivity:2,operationalRatio:0.30,seniorityVariance:3,recentLayoffs:6,mAndA:2,restructuring:4,privatization:0 },
  { id:'sulamerica',name:'SulAmérica',sector:'healthcare',segment:'Healthcare',employees:5000,headquarters:'Rio de Janeiro, RJ',cargoDiversity:6,multiState:7,unionActivity:5,operationalRatio:0.40,seniorityVariance:6,recentLayoffs:4,mAndA:8,restructuring:6,privatization:0 },
  { id:'banco-pan',name:'Banco Pan',sector:'financial_services',segment:'Financial Services',employees:4500,headquarters:'São Paulo, SP',cargoDiversity:5,multiState:5,unionActivity:5,operationalRatio:0.45,seniorityVariance:5,recentLayoffs:3,mAndA:4,restructuring:3,privatization:0 },
  { id:'light',name:'Light',sector:'utilities',segment:'Utilities',employees:4000,headquarters:'Rio de Janeiro, RJ',cargoDiversity:7,multiState:2,unionActivity:8,operationalRatio:0.65,seniorityVariance:8,recentLayoffs:6,mAndA:2,restructuring:8,privatization:3 },
  { id:'inter',name:'Inter (Banco Inter)',sector:'financial_services',segment:'Financial Services',employees:4000,headquarters:'Belo Horizonte, MG',cargoDiversity:5,multiState:3,unionActivity:3,operationalRatio:0.30,seniorityVariance:3,recentLayoffs:4,mAndA:3,restructuring:3,privatization:0 },
  { id:'bv',name:'BV (Banco Votorantim)',sector:'financial_services',segment:'Financial Services',employees:3500,headquarters:'São Paulo, SP',cargoDiversity:5,multiState:5,unionActivity:5,operationalRatio:0.40,seniorityVariance:6,recentLayoffs:2,mAndA:2,restructuring:2,privatization:0 },
  { id:'bmg',name:'Banco BMG',sector:'financial_services',segment:'Financial Services',employees:3500,headquarters:'Belo Horizonte, MG',cargoDiversity:5,multiState:6,unionActivity:5,operationalRatio:0.50,seniorityVariance:6,recentLayoffs:4,mAndA:2,restructuring:4,privatization:0 },
  { id:'meta',name:'Meta',sector:'tech',segment:'Tech',employees:3000,headquarters:'São Paulo, SP',cargoDiversity:6,multiState:2,unionActivity:1,operationalRatio:0.10,seniorityVariance:4,recentLayoffs:9,mAndA:2,restructuring:8,privatization:0 },
  { id:'agi',name:'Agi (Agibank)',sector:'financial_services',segment:'Financial Services',employees:3000,headquarters:'Porto Alegre, RS',cargoDiversity:5,multiState:4,unionActivity:4,operationalRatio:0.50,seniorityVariance:4,recentLayoffs:3,mAndA:2,restructuring:3,privatization:0 },
  { id:'banco-mercantil',name:'Banco Mercantil',sector:'financial_services',segment:'Financial Services',employees:3000,headquarters:'Belo Horizonte, MG',cargoDiversity:5,multiState:5,unionActivity:5,operationalRatio:0.50,seniorityVariance:7,recentLayoffs:3,mAndA:1,restructuring:3,privatization:0 },
  { id:'recovery',name:'Recovery',sector:'financial_services',segment:'Financial Services',employees:2500,headquarters:'São Paulo, SP',cargoDiversity:4,multiState:4,unionActivity:3,operationalRatio:0.60,seniorityVariance:4,recentLayoffs:3,mAndA:3,restructuring:3,privatization:0 },
  { id:'banco-daycoval',name:'Banco Daycoval',sector:'financial_services',segment:'Financial Services',employees:2000,headquarters:'São Paulo, SP',cargoDiversity:4,multiState:3,unionActivity:4,operationalRatio:0.35,seniorityVariance:5,recentLayoffs:2,mAndA:1,restructuring:1,privatization:0 },
  { id:'uber',name:'Uber',sector:'tech',segment:'Tech',employees:1500,headquarters:'São Paulo, SP',cargoDiversity:5,multiState:10,unionActivity:6,operationalRatio:0.25,seniorityVariance:3,recentLayoffs:5,mAndA:2,restructuring:4,privatization:0 },
  { id:'omni',name:'Omni',sector:'financial_services',segment:'Financial Services',employees:1500,headquarters:'São Paulo, SP',cargoDiversity:4,multiState:3,unionActivity:4,operationalRatio:0.40,seniorityVariance:5,recentLayoffs:2,mAndA:1,restructuring:2,privatization:0 },
  { id:'banco-volkswagen',name:'Banco Volkswagen',sector:'financial_services',segment:'Financial Services',employees:1200,headquarters:'São Paulo, SP',cargoDiversity:4,multiState:2,unionActivity:5,operationalRatio:0.30,seniorityVariance:6,recentLayoffs:2,mAndA:3,restructuring:2,privatization:0 },
  { id:'loft',name:'Loft',sector:'tech',segment:'Tech',employees:1000,headquarters:'São Paulo, SP',cargoDiversity:5,multiState:3,unionActivity:1,operationalRatio:0.30,seniorityVariance:3,recentLayoffs:9,mAndA:5,restructuring:8,privatization:0 },
  { id:'nio',name:'NIO',sector:'telecom',segment:'Telecom',employees:1000,headquarters:'São Paulo, SP',cargoDiversity:4,multiState:2,unionActivity:3,operationalRatio:0.30,seniorityVariance:3,recentLayoffs:2,mAndA:1,restructuring:2,privatization:0 },
  { id:'bem-promotora',name:'Bem Promotora',sector:'financial_services',segment:'Financial Services',employees:800,headquarters:'São Paulo, SP',cargoDiversity:3,multiState:2,unionActivity:3,operationalRatio:0.50,seniorityVariance:4,recentLayoffs:1,mAndA:1,restructuring:1,privatization:0 },
  { id:'parana-banco',name:'Paraná Banco',sector:'financial_services',segment:'Financial Services',employees:800,headquarters:'Curitiba, PR',cargoDiversity:3,multiState:3,unionActivity:4,operationalRatio:0.40,seniorityVariance:5,recentLayoffs:1,mAndA:1,restructuring:1,privatization:0 },
  { id:'airbnb',name:'Airbnb',sector:'tech',segment:'Tech',employees:500,headquarters:'São Paulo, SP',cargoDiversity:4,multiState:1,unionActivity:1,operationalRatio:0.10,seniorityVariance:3,recentLayoffs:4,mAndA:1,restructuring:3,privatization:0 },
];

export const companies = rawCompanies
  .map((c) => ({ ...c, score: calcScore(c) }))
  .sort((a, b) => b.score.total - a.score.total);

export const segments = [...new Set(rawCompanies.map((c) => c.segment))].sort();

export function getCompanyById(id) {
  return companies.find((c) => c.id === id) || null;
}
