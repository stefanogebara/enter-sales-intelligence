/**
 * Agent Simulation endpoint — inspired by Mirofish.
 *
 * Generates multiple AI personas (CFO, CLO, CHRO, Board Member, Union Leader)
 * that analyze the same company's labor litigation scenario from their perspective.
 * Shows how a case reverberates across stakeholders.
 */

import { companies } from '../server/lib/companies.js';
import { calculateScore } from '../server/lib/scoring.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const PERSONAS = [
  {
    id: 'cfo',
    title: 'CFO',
    emoji: 'CFO',
    color: '#3B82F6',
    prompt: `Você é o CFO (diretor financeiro) dessa empresa. Analise o cenário trabalhista da perspectiva FINANCEIRA em 3-4 frases curtas. Foque em: provisão no balanço, impacto no EBITDA, previsibilidade de custos, risco de surpresa para investidores. Seja direto e use números.`,
  },
  {
    id: 'clo',
    title: 'Diretor Jurídico',
    emoji: 'CLO',
    color: '#FFAE35',
    prompt: `Você é o CLO (diretor jurídico) dessa empresa. Analise o cenário trabalhista da perspectiva JURÍDICA em 3-4 frases curtas. Foque em: volume de casos ativos, capacidade da equipe, qualidade dos escritórios terceirizados, risco de precedentes negativos. Seja direto.`,
  },
  {
    id: 'chro',
    title: 'Diretor de RH',
    emoji: 'CHRO',
    color: '#22C55E',
    prompt: `Você é o CHRO (diretor de RH) dessa empresa. Analise o cenário trabalhista da perspectiva de PESSOAS em 3-4 frases curtas. Foque em: moral dos funcionários, impacto na marca empregadora, dificuldade de retenção, Glassdoor/reputação. Seja direto.`,
  },
  {
    id: 'union',
    title: 'Líder Sindical',
    emoji: 'SIND',
    color: '#EF4444',
    prompt: `Você é o líder do sindicato que representa os funcionários dessa empresa. Analise a situação da perspectiva dos TRABALHADORES em 3-4 frases curtas. Foque em: demissões injustas, condições de trabalho, horas extras não pagas, assédio moral, mobilização coletiva. Seja combativo mas factual.`,
  },
  {
    id: 'board',
    title: 'Membro do Conselho',
    emoji: 'BOARD',
    color: '#A855F7',
    prompt: `Você é um membro do conselho de administração dessa empresa. Analise o cenário trabalhista da perspectiva ESTRATÉGICA em 3-4 frases curtas. Foque em: risco reputacional, governança, ESG, comparação com pares do setor, necessidade de ação preventiva. Seja estratégico.`,
  },
];

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
    // Run all 5 personas in parallel
    const results = await Promise.all(
      PERSONAS.map(async (persona) => {
        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://enter-sales-intelligence.vercel.app',
            'X-Title': 'Enter Simulation',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-haiku-3.5',
            max_tokens: 300,
            messages: [
              { role: 'system', content: `${persona.prompt}\n\nResponda em português do Brasil. Máximo 4 frases.` },
              { role: 'user', content: context },
            ],
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) throw new Error(`${persona.id}: ${response.status}`);
        const data = await response.json();
        return {
          id: persona.id,
          title: persona.title,
          label: persona.emoji,
          color: persona.color,
          text: data.choices?.[0]?.message?.content || '',
        };
      })
    );

    res.json({ personas: results, company: company.name });
  } catch (err) {
    console.error('simulate error:', err.message);
    res.status(500).json({ error: 'Falha na simulação. Tente novamente.' });
  }
}

export const config = { maxDuration: 30 };
