/**
 * Client-side company data with pre-calculated scores.
 * This is a static snapshot so the dashboard renders instantly without API calls.
 * Deep analysis via Claude API will override these with real-time data.
 */

// Inline scoring logic (mirrors server/lib/scoring.js)
const SECTOR_TURNOVER = {
  financial_services: 0.12, tech: 0.18, retail: 0.30,
  airlines: 0.15, telecom: 0.14, healthcare: 0.16,
  utilities: 0.08, services: 0.35,
};

const CNJ_SECTOR_BENCHMARK = {
  financial_services: 3.2, tech: 1.8, retail: 4.5,
  airlines: 5.1, telecom: 3.8, healthcare: 2.9,
  utilities: 2.1, services: 6.2,
};

const AVG_CASE_COST_BRL = {
  financial_services: 45000, tech: 38000, retail: 28000,
  airlines: 52000, telecom: 35000, healthcare: 32000,
  utilities: 40000, services: 22000,
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function norm(v, lo, hi) { return hi === lo ? 0 : clamp(((v - lo) / (hi - lo)) * 100, 0, 100); }

function calcScore(c) {
  const t = SECTOR_TURNOVER[c.sector] || 0.15;
  const cnjR = CNJ_SECTOR_BENCHMARK[c.sector] || 3.0;
  const avgC = AVG_CASE_COST_BRL[c.sector] || 35000;
  const sep = c.employees * t;
  const cases = (c.employees / 1000) * cnjR;
  const annCost = cases * avgC;
  const volRaw = norm(Math.log10(sep + 1), 1, 4.5);
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
  return {
    total, volume: Math.round(volRaw), complexity: Math.round(cxRaw),
    timing: Math.round(tmRaw), verdict,
    estimatedCases: Math.round(cases),
    estimatedAnnualCostBRL: Math.round(annCost),
    estimatedARR: Math.round((annCost * 0.3) / 5.5),
    annualSeparations: Math.round(sep),
    turnoverRate: t, cnjRate: cnjR, avgCaseCost: avgC,
    complexityFactors: cxFactors, timingFactors: tmFactors,
  };
}

const rawCompanies = [
  { id:'itau',name:'Itaú Unibanco',sector:'financial_services',segment:'Financial Services',employees:96000,headquarters:'São Paulo, SP',cargoDiversity:9,multiState:10,unionActivity:9,operationalRatio:0.50,seniorityVariance:9,recentLayoffs:6,mAndA:7,restructuring:7,privatization:0 },
  { id:'bradesco',name:'Bradesco',sector:'financial_services',segment:'Financial Services',employees:87000,headquarters:'Osasco, SP',cargoDiversity:9,multiState:10,unionActivity:9,operationalRatio:0.50,seniorityVariance:9,recentLayoffs:7,mAndA:5,restructuring:8,privatization:0 },
  { id:'hapvida',name:'Hapvida',sector:'healthcare',segment:'Healthcare',employees:68000,headquarters:'Fortaleza, CE',cargoDiversity:9,multiState:10,unionActivity:7,operationalRatio:0.80,seniorityVariance:7,recentLayoffs:5,mAndA:10,restructuring:8,privatization:0 },
  { id:'santander',name:'Santander Brasil',sector:'financial_services',segment:'Financial Services',employees:55000,headquarters:'São Paulo, SP',cargoDiversity:8,multiState:10,unionActivity:9,operationalRatio:0.55,seniorityVariance:8,recentLayoffs:4,mAndA:3,restructuring:5,privatization:0 },
  { id:'verzani-sandrini',name:'Verzani & Sandrini',sector:'services',segment:'Services',employees:45000,headquarters:'São Paulo, SP',cargoDiversity:6,multiState:10,unionActivity:6,operationalRatio:0.90,seniorityVariance:5,recentLayoffs:3,mAndA:4,restructuring:3,privatization:0 },
  { id:'aec',name:'AeC',sector:'services',segment:'Services',employees:45000,headquarters:'Belo Horizonte, MG',cargoDiversity:4,multiState:8,unionActivity:5,operationalRatio:0.92,seniorityVariance:3,recentLayoffs:4,mAndA:3,restructuring:3,privatization:0 },
  { id:'mercado-livre',name:'Mercado Livre',sector:'retail',segment:'Retail',employees:40000,headquarters:'São Paulo, SP',cargoDiversity:9,multiState:10,unionActivity:5,operationalRatio:0.65,seniorityVariance:6,recentLayoffs:2,mAndA:4,restructuring:3,privatization:0 },
  { id:'vivo',name:'Vivo (Telefônica Brasil)',sector:'telecom',segment:'Telecom',employees:33000,headquarters:'São Paulo, SP',cargoDiversity:8,multiState:10,unionActivity:8,operationalRatio:0.55,seniorityVariance:8,recentLayoffs:5,mAndA:7,restructuring:6,privatization:4 },
  { id:'magalu',name:'Magazine Luiza',sector:'retail',segment:'Retail',employees:28000,headquarters:'Franca, SP',cargoDiversity:8,multiState:10,unionActivity:6,operationalRatio:0.70,seniorityVariance:7,recentLayoffs:6,mAndA:5,restructuring:6,privatization:0 },
  { id:'latam',name:'LATAM Airlines Brasil',sector:'airlines',segment:'Airlines',employees:20000,headquarters:'São Paulo, SP',cargoDiversity:9,multiState:10,unionActivity:9,operationalRatio:0.75,seniorityVariance:8,recentLayoffs:8,mAndA:6,restructuring:9,privatization:0 },
  { id:'energisa',name:'Energisa',sector:'utilities',segment:'Utilities',employees:18000,headquarters:'Cataguases, MG',cargoDiversity:7,multiState:10,unionActivity:7,operationalRatio:0.70,seniorityVariance:7,recentLayoffs:3,mAndA:7,restructuring:4,privatization:5 },
  { id:'azul',name:'Azul Linhas Aéreas',sector:'airlines',segment:'Airlines',employees:14000,headquarters:'Barueri, SP',cargoDiversity:8,multiState:10,unionActivity:8,operationalRatio:0.75,seniorityVariance:7,recentLayoffs:6,mAndA:3,restructuring:7,privatization:0 },
  { id:'tim',name:'TIM Brasil',sector:'telecom',segment:'Telecom',employees:10000,headquarters:'Rio de Janeiro, RJ',cargoDiversity:7,multiState:10,unionActivity:7,operationalRatio:0.50,seniorityVariance:7,recentLayoffs:4,mAndA:8,restructuring:5,privatization:0 },
  { id:'nubank',name:'Nubank',sector:'financial_services',segment:'Financial Services',employees:8000,headquarters:'São Paulo, SP',cargoDiversity:6,multiState:5,unionActivity:3,operationalRatio:0.35,seniorityVariance:4,recentLayoffs:5,mAndA:2,restructuring:4,privatization:0 },
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
