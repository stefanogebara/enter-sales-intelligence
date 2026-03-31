/**
 * Multi-Stakeholder Simulation v2 — Mirofish-inspired.
 *
 * Round 1: 5 personas analyze the scenario independently
 * Round 2: Each persona sees what the others said and reacts
 * Synthesis: AI generates consensus, conflicts, and urgency score
 */

import { companies } from '../server/lib/companies.js';
import { calculateScore } from '../server/lib/scoring.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const HAIKU = 'anthropic/claude-3.5-haiku';
const SONNET = 'anthropic/claude-sonnet-4-6';

const PERSONAS = [
  { id: 'cfo', title: 'CFO', label: 'CFO', color: '#3B82F6',
    prompt: 'Você é o CFO. Analise pela perspectiva FINANCEIRA em 3-4 frases: provisão no balanço, impacto no EBITDA, previsibilidade de custos, risco para investidores.' },
  { id: 'clo', title: 'Diretor Jurídico', label: 'CLO', color: '#FFAE35',
    prompt: 'Você é o CLO. Analise pela perspectiva JURÍDICA em 3-4 frases: volume de casos, capacidade da equipe, escritórios terceirizados, precedentes.' },
  { id: 'chro', title: 'Diretor de RH', label: 'CHRO', color: '#22C55E',
    prompt: 'Você é o CHRO. Analise pela perspectiva de PESSOAS em 3-4 frases: moral, marca empregadora, retenção, Glassdoor.' },
  { id: 'union', title: 'Líder Sindical', label: 'SIND', color: '#EF4444',
    prompt: 'Você é o líder sindical. Analise pela perspectiva dos TRABALHADORES em 3-4 frases: demissões injustas, condições, horas extras, mobilização coletiva.' },
  { id: 'board', title: 'Membro do Conselho', label: 'BOARD', color: '#A855F7',
    prompt: 'Você é membro do conselho. Analise pela perspectiva ESTRATÉGICA em 3-4 frases: reputação, ESG, pares do setor, ação preventiva.' },
];

async function callLLM(model, system, user, timeout = 15000) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: model === HAIKU ? 300 : 600,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { companyId } = req.body;
  if (!companyId || typeof companyId !== 'string' || !/^[a-z0-9-]+$/.test(companyId)) {
    return res.status(400).json({ error: 'companyId inválido' });
  }

  const company = companies.find((c) => c.id === companyId);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

  const score = calculateScore(company);
  const context = `Empresa: ${company.name} (${company.segment})
Funcionários: ${company.employees.toLocaleString()}
Sede: ${company.headquarters}
Score de risco trabalhista: ${score.total}/100 (${score.verdict})
Casos estimados/ano: ~${score.estimatedCases.toLocaleString()}
Custo estimado: R$${(score.estimatedAnnualCostBRL / 1e6).toFixed(0)}M/ano
${company.notes || ''}`;

  try {
    // === ROUND 1: Independent analysis ===
    const round1 = await Promise.all(
      PERSONAS.map(async (p) => {
        const text = await callLLM(HAIKU, `${p.prompt}\nResponda em português do Brasil. Máximo 4 frases.`, context);
        return { ...p, text };
      })
    );

    // === ROUND 2: Reaction (each persona sees the others) ===
    const allOpinions = round1.map((p) => `[${p.title}]: ${p.text}`).join('\n\n');

    const round2 = await Promise.all(
      round1.map(async (p) => {
        const othersText = round1.filter((o) => o.id !== p.id).map((o) => `[${o.title}]: ${o.text}`).join('\n\n');
        const reaction = await callLLM(HAIKU,
          `Você é o ${p.title} da empresa ${company.name}. Você acabou de ouvir a análise dos outros stakeholders. Em 1-2 frases, reaja: você concorda, discorda, ou quer adicionar algo? Seja direto. Português do Brasil.`,
          `Sua análise original:\n${p.text}\n\nO que os outros disseram:\n${othersText}`
        );
        return { ...p, reaction };
      })
    );

    // === SYNTHESIS: Consensus & Conflicts ===
    const synthesis = await callLLM(SONNET,
      `Analise as perspectivas de 5 stakeholders sobre o cenário trabalhista de ${company.name}. Retorne em português do Brasil, formato:

## Consenso
[1-2 frases: em que TODOS concordam]

## Conflitos
[1-2 frases: onde as perspectivas DIVERGEM]

## Urgência
[1 frase + score de 1-10 de quão urgente é agir]

Seja direto e específico.`,
      allOpinions,
      20000
    );

    res.json({
      company: company.name,
      personas: round2.map((p) => ({
        id: p.id,
        title: p.title,
        label: p.label,
        color: p.color,
        text: p.text,
        reaction: p.reaction,
      })),
      synthesis,
    });
  } catch (err) {
    console.error('simulate error:', err.message);
    res.status(500).json({ error: 'Falha na simulação. Tente novamente.' });
  }
}

export const config = { maxDuration: 60 };
