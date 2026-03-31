import { useState } from 'react';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { companies } from '../data/companies';

const SLIDES = [HeroSlide, ProblemSlide, OpportunitySlide, ScoreSlide, PrioritizationSlide, DiscoverySlide, WhatItDoes, PitchSlide, PipelineSlide];

export default function Presentation({ onEnterPlatform }) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;
  const Slide = SLIDES[slide];

  return (
    <div className="min-h-screen bg-enter-black flex flex-col">
      {/* Gold bar */}
      <div className="bg-enter-gold flex items-center justify-between px-8 py-3">
        <span className="font-mono text-label uppercase text-enter-black">
          Case Growth · Summer 2026
        </span>
        <div className="flex items-center gap-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === slide ? 'bg-enter-black w-8' : i < slide ? 'bg-enter-black/40 w-2' : 'bg-enter-black/20 w-2'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={onEnterPlatform}
          className="font-mono text-label uppercase text-enter-black/60 hover:text-enter-black transition-colors cursor-pointer"
        >
          Pular →
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center" key={slide}>
        <div className="w-full max-w-[1100px] px-12 animate-fadeIn">
          <Slide onEnter={onEnterPlatform} />
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-12 py-6">
        <button
          onClick={() => slide > 0 && setSlide(s => s - 1)}
          className={`font-mono text-label uppercase flex items-center gap-2 cursor-pointer transition-colors ${
            slide === 0 ? 'text-enter-gray-800' : 'text-enter-gray-500 hover:text-enter-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <span className="font-mono text-caption text-enter-gray-600">{slide + 1} / {SLIDES.length}</span>
        {isLast ? (
          <button onClick={onEnterPlatform}
            className="font-mono text-label uppercase flex items-center gap-2 border border-enter-white text-enter-white px-8 py-4 rounded-enter hover:bg-enter-white hover:text-enter-black transition-colors cursor-pointer">
            Entrar na Plataforma <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => setSlide(s => s + 1)}
            className="font-mono text-label uppercase flex items-center gap-2 text-enter-gray-500 hover:text-enter-white transition-colors cursor-pointer">
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── 1. HERO ───
function HeroSlide() {
  const qualified = companies.filter(c => c.score.verdict === 'QUALIFIED').length;
  return (
    <div>
      <p className="font-mono text-label uppercase text-enter-gold mb-12">Stefano Gebara</p>
      <h1 className="text-display text-enter-white mb-4">Qualificação Trabalhista</h1>
      <h2 className="text-display text-enter-gold">com Sales Intelligence</h2>
      <p className="text-body-lg text-enter-gray-400 mt-12 max-w-2xl">
        Uma plataforma que analisa automaticamente quais clientes da Enter
        têm maior potencial para o novo produto de contencioso trabalhista.
      </p>
      <div className="flex items-center gap-16 mt-16">
        <Stat value={companies.length} label="empresas" />
        <Stat value={qualified} label="qualificadas" />
        <Stat value="R$50.6B" label="pagos em 2025" mono />
        <Stat value="2.4M" label="casos/ano" mono />
      </div>
    </div>
  );
}

// ─── 2. O PROBLEMA ───
function ProblemSlide() {
  return (
    <div>
      <p className="font-mono text-label uppercase text-enter-gold mb-12">O Problema</p>
      <h2 className="text-title-lg text-enter-white mb-12">
        No Brasil, funcionários podem<br />
        <span className="text-enter-gold">processar suas empresas</span>
      </h2>

      <div className="grid grid-cols-3 gap-12">
        <SimpleCard
          number="2.4M"
          title="Processos novos por ano"
          desc="Funcionários entram na justiça contra as empresas por horas extras não pagas, demissões injustas, condições de trabalho, etc."
        />
        <SimpleCard
          number="R$50.6B"
          title="Custo total para empresas"
          desc="Em 2025, empresas brasileiras pagaram mais de 50 bilhões de reais em processos trabalhistas. É o recorde histórico."
        />
        <SimpleCard
          number="~80%"
          title="Funcionário ganha"
          desc="Na maioria dos casos, o funcionário ganha (total ou parcialmente). As empresas precisam se defender bem em cada processo."
        />
      </div>

      <p className="text-body-lg text-enter-gray-500 mt-12">
        Empresas grandes como Bradesco, Itaú e Vivo recebem{' '}
        <span className="text-enter-white">milhares de processos por ano</span>. Gerenciar tudo isso manualmente é impossível.
      </p>
    </div>
  );
}

// ─── 3. A OPORTUNIDADE ───
function OpportunitySlide() {
  return (
    <div>
      <p className="font-mono text-label uppercase text-enter-gold mb-12">A Oportunidade</p>
      <h2 className="text-title-lg text-enter-white mb-12">
        A Enter já atende esses clientes.<br />
        <span className="text-enter-gold">Agora quer vender mais.</span>
      </h2>

      <div className="grid grid-cols-2 gap-16">
        <div>
          <p className="font-mono text-label uppercase text-enter-gray-500 mb-4">Hoje</p>
          <p className="text-title-sm text-enter-white mb-3">Produto Consumerista</p>
          <p className="text-body-lg text-enter-gray-400">
            A Enter usa IA para defender empresas em processos de consumidores
            (quando um cliente processa um banco, por exemplo).
            Já atende Itaú, Bradesco, Nubank, LATAM, Mercado Livre e outros.
          </p>
        </div>
        <div>
          <p className="font-mono text-label uppercase text-enter-gold mb-4">Novo</p>
          <p className="text-title-sm text-enter-gold mb-3">Produto Trabalhista</p>
          <p className="text-body-lg text-enter-gray-400">
            A mesma tecnologia, agora para processos trabalhistas
            (quando um funcionário processa a empresa).
            É um upsell — vender algo novo para quem já é cliente.
          </p>
        </div>
      </div>

      <div className="mt-12 border-t border-enter-gray-800 pt-8">
        <p className="text-body-lg text-enter-gray-500">
          <span className="text-enter-white">A pergunta central:</span>{' '}
          Quais desses clientes têm volume suficiente de processos trabalhistas
          para justificar um contrato de no mínimo{' '}
          <span className="text-enter-gold font-mono">US$500k/ano</span>?
        </p>
      </div>
    </div>
  );
}

// ─── 4. COMO QUALIFICAR ───
function ScoreSlide() {
  return (
    <div>
      <p className="font-mono text-label uppercase text-enter-gold mb-12">Como Qualificar</p>
      <h2 className="text-title-lg text-enter-white mb-16">
        Um score de 0 a 100 baseado em<br />
        <span className="text-enter-gold">dados públicos verificáveis</span>
      </h2>

      <div className="grid grid-cols-3 gap-16 mb-12">
        <Dimension
          pct="30%" title="Volume" color="border-blue-500"
          desc="Quantos processos a empresa provavelmente recebe?"
          lines={['Número de funcionários', 'Taxa de processos do setor (TST)', 'Glassdoor e Reclame Aqui como proxy']}
        />
        <Dimension
          pct="40%" title="Complexidade" color="border-enter-gold"
          desc="Quão complicado é o contencioso dessa empresa?"
          lines={['Em quantos estados opera?', 'Tem sindicato ativo brigando?', 'Usa muita terceirização?', 'É empresa de capital aberto?']}
        />
        <Dimension
          pct="30%" title="Timing" color="border-orange-500"
          desc="Aconteceu algo recente que gera mais processos?"
          lines={['Demissões em massa recentes', 'Fusão ou aquisição de empresa', 'Reestruturação corporativa']}
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <p className="text-body-lg text-enter-gray-500">
          <span className="text-enter-white">Fontes:</span> TST Ranking, CNJ em Números,
          Glassdoor, Reclame Aqui, CVM/SEC filings.
          Com acesso ao <span className="text-enter-gold">Codex</span> (base do CNJ com 237M de processos),
          seria possível aplicar jurimetria preditiva por empresa.
        </p>
        <p className="text-body-lg text-enter-gray-500">
          <span className="text-enter-white">Os pesos (30/40/30) são configuráveis</span> —
          a Enter pode ajustar conforme o perfil de cliente ideal evolui.
          Um 4o critério possível: probabilidade de êxito via jurimetria.
        </p>
      </div>
    </div>
  );
}

// ─── 5. PRIORIZAÇÃO (resposta direta do case) ───
function PrioritizationSlide() {
  const top5 = companies.slice(0, 5);
  return (
    <div>
      <p className="font-mono text-label uppercase text-enter-gold mb-12">Resposta · Priorização</p>
      <h2 className="text-title-lg text-enter-white mb-12">
        Top 5 empresas para<br />
        <span className="text-enter-gold">atacar primeiro</span>
      </h2>

      <div className="space-y-4">
        {top5.map((c, i) => (
          <div key={c.id} className="flex items-center gap-6 border-b border-enter-gray-800 pb-4">
            <span className="font-mono text-title-sm text-enter-gray-600 w-10">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex-1">
              <div className="flex items-baseline gap-3">
                <span className="text-title-sm text-enter-white">{c.name}</span>
                <span className="text-body-lg text-enter-gray-500">{c.segment}</span>
              </div>
              <p className="text-body-lg text-enter-gray-400 mt-1">
                {c.employees.toLocaleString('pt-BR')} func. · ~{c.score.estimatedCases.toLocaleString('pt-BR')} casos/ano · ARR est.{' '}
                <span className="text-enter-gold font-mono">US${(c.score.estimatedARR / 1000).toFixed(0)}k</span>
              </p>
            </div>
            <span className="font-mono text-title-md text-enter-white">{c.score.total}</span>
          </div>
        ))}
      </div>

      <p className="text-body-lg text-enter-gray-500 mt-8">
        <span className="text-enter-white">Por que esses?</span>{' '}
        Maior volume de funcionários × setores com mais processos × eventos recentes (demissões, reestruturação).
        O Bradesco é #1 pela combinação de 84 mil funcionários + 2.200 demissões em 2024 + sindicato muito ativo.
      </p>
    </div>
  );
}

// ─── 6. DISCOVERY (resposta direta do case) ───
function DiscoverySlide() {
  return (
    <div>
      <p className="font-mono text-label uppercase text-enter-gold mb-8">Resposta · Discovery</p>
      <h2 className="text-title-md text-enter-white mb-8">
        Roteiro para o <span className="text-enter-gold">Bradesco</span>
        <span className="text-body-lg text-enter-gray-500 ml-3">(cliente #1)</span>
      </h2>

      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
        <QBlock cat="Dor" color="text-orange-400" questions={[
          'Com 2.200 demissões e 390 agências fechadas no último ano, como está o volume de novos processos trabalhistas? A equipe jurídica está conseguindo absorver?',
          'Quanto o Bradesco gasta por ano com contencioso trabalhista? Esse número tem crescido?',
        ]} />
        <QBlock cat="Processo" color="text-blue-400" questions={[
          'Como funciona hoje a gestão dos escritórios de advocacia externos? Existe um sistema centralizado ou cada escritório reporta separado?',
          'Na hora de decidir se faz acordo ou briga no processo, como é feito? Tem algum critério ou cada caso é decidido individualmente?',
        ]} />
        <QBlock cat="Budget" color="text-enter-gold" questions={[
          'Existe uma meta de redução de custo de litígio ou é tratado como custo fixo? O board pressiona por eficiência nessa área?',
          'Se eu te mostrasse uma forma de reduzir 30% do custo por processo, com dados auditáveis, quanto isso representaria em reais por ano?',
        ]} />
        <QBlock cat="Decisão" color="text-verdict-qualified" questions={[
          'Quem decide a contratação de uma solução de gestão de contencioso trabalhista? É o jurídico, o CFO, ou os dois juntos?',
          'Vocês já usam a Enter no consumerista — o que precisaria acontecer para expandir para o trabalhista?',
        ]} />
      </div>
    </div>
  );
}

// ─── 7. PITCH (resposta direta do case) ───
function PitchSlide() {
  return (
    <div>
      <p className="font-mono text-label uppercase text-enter-gold mb-8">Resposta · Pitch CFO</p>
      <h2 className="text-title-md text-enter-white mb-2">
        Para o <span className="text-enter-gold">CFO do Bradesco</span>
      </h2>
      <p className="text-caption text-enter-gray-600 mb-8">estrutura: dor → solução → urgência</p>

      <div className="space-y-8 max-w-3xl">
        <div>
          <p className="font-mono text-label uppercase text-orange-400 mb-3">§1 — A dor</p>
          <p className="text-body-lg text-enter-gray-300 leading-relaxed">
            Vocês demitiram 2.200 pessoas e fecharam 390 agências no último ano.
            Isso vai gerar uma onda de processos trabalhistas nos próximos meses.
            São ~8.400 casos novos por ano, custando mais de R$250 milhões.
            A pergunta não é se vai crescer — é se vocês estão preparados pra absorver esse crescimento.
          </p>
        </div>
        <div>
          <p className="font-mono text-label uppercase text-blue-400 mb-3">§2 — A solução</p>
          <p className="text-body-lg text-enter-gray-300 leading-relaxed">
            Vocês já usam a Enter no consumerista. A mesma IA agora faz no trabalhista:
            analisa documentos, gera defesas automáticas, recomenda acordos e centraliza
            todos os escritórios numa plataforma só. Resultado: 30% menos custo por processo
            e previsibilidade no quanto vai gastar — em vez de surpresas no balanço.
          </p>
        </div>
        <div>
          <p className="font-mono text-label uppercase text-verdict-qualified mb-3">§3 — A urgência</p>
          <p className="text-body-lg text-enter-gray-300 leading-relaxed">
            Os processos das demissões de 2024 vão começar a chegar agora.
            Montar essa operação depois que o volume explodir custa 3x mais.
            Vocês já são clientes Enter — a integração é rápida.
            Podemos mostrar uma simulação com os números reais do Bradesco essa semana.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 8. O QUE A PLATAFORMA FAZ ───
function WhatItDoes() {
  return (
    <div>
      <p className="font-mono text-label uppercase text-enter-gold mb-12">O Que Ela Faz</p>
      <h2 className="text-title-lg text-enter-white mb-16">
        4 etapas automáticas para<br />
        <span className="text-enter-gold">cada empresa da base</span>
      </h2>

      <div className="space-y-8">
        <Step n="01" title="Ranking" color="text-blue-400"
          desc="Mostra todas as 36 empresas da base Enter ordenadas pelo score. Você vê de cara quem tem mais potencial." />
        <Step n="02" title="Qualificação com IA" color="text-enter-gold"
          desc="Clica numa empresa e a IA pesquisa na internet em tempo real: quantos funcionários tem, se teve demissões recentes, se tem sindicato ativo, quanto gasta com processos." />
        <Step n="03" title="Perguntas de Discovery" color="text-orange-400"
          desc="Gera 8 perguntas prontas para fazer numa reunião com o diretor jurídico da empresa. Tipo: 'Como vocês gerenciam os processos trabalhistas hoje? Quanto gastam por ano?'" />
        <Step n="04" title="Pitch para o CFO" color="text-verdict-qualified"
          desc="Escreve 3 parágrafos persuasivos para enviar ao CFO (diretor financeiro) da empresa, explicando por que ele deveria contratar a Enter para gerenciar o contencioso trabalhista." />
      </div>
    </div>
  );
}

// ─── 6. PIPELINE → PLATAFORMA ───
function PipelineSlide({ onEnter }) {
  return (
    <div className="text-center">
      <p className="font-mono text-label uppercase text-enter-gold mb-12">Vamos ver?</p>
      <h2 className="text-title-lg text-enter-white mb-6">
        Tudo isso funcionando<br />
        <span className="text-enter-gold">ao vivo</span>
      </h2>
      <p className="text-body-lg text-enter-gray-400 mb-16 max-w-xl mx-auto">
        Selecione qualquer empresa e veja o pipeline completo
        rodar em tempo real com dados da internet.
      </p>

      <div className="flex items-center justify-center gap-6 mb-16">
        {[
          { n: '01', label: 'Dashboard', sub: `${companies.length} empresas` },
          { n: '02', label: 'Qualificação', sub: 'pesquisa web ao vivo' },
          { n: '03', label: 'Discovery', sub: '8 perguntas prontas' },
          { n: '04', label: 'Pitch CFO', sub: '3 parágrafos' },
        ].map(({ n, label, sub }, i) => (
          <div key={n} className="flex items-center gap-6">
            <div className="text-left">
              <span className="font-mono text-caption text-enter-gray-600">{n}</span>
              <p className="text-title-sm text-enter-white">{label}</p>
              <p className="text-caption text-enter-gray-500 mt-1">{sub}</p>
            </div>
            {i < 3 && <ArrowRight className="w-5 h-5 text-enter-gray-700 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <button onClick={onEnter}
        className="font-mono text-label uppercase border border-enter-white text-enter-white px-12 py-5 rounded-enter hover:bg-enter-white hover:text-enter-black transition-colors cursor-pointer">
        Entrar na Plataforma
      </button>
    </div>
  );
}

// ─── SHARED ───
function Stat({ value, label, mono }) {
  return (
    <div>
      <p className={`text-title-md text-enter-white ${mono ? 'font-mono' : ''}`}>{value}</p>
      <p className="text-caption text-enter-gray-500 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function SimpleCard({ number, title, desc }) {
  return (
    <div>
      <p className="text-title-md text-enter-gold font-mono mb-2">{number}</p>
      <p className="text-body-md text-enter-white font-medium mb-2">{title}</p>
      <p className="text-body-lg text-enter-gray-500">{desc}</p>
    </div>
  );
}

function Dimension({ pct, title, color, desc, lines }) {
  return (
    <div className={`border-t-2 ${color} pt-6`}>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-mono text-caption text-enter-gray-500">{pct}</span>
        <h3 className="text-title-sm text-enter-white">{title}</h3>
      </div>
      <p className="text-body-lg text-enter-gray-500 mb-4">{desc}</p>
      <div className="space-y-1.5">
        {lines.map((l, i) => (
          <p key={i} className="text-body-lg text-enter-gray-400">— {l}</p>
        ))}
      </div>
    </div>
  );
}

function QBlock({ cat, color, questions }) {
  return (
    <div>
      <p className={`font-mono text-label uppercase ${color} mb-3`}>{cat}</p>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <p key={i} className="text-body-lg text-enter-gray-400 leading-relaxed">"{q}"</p>
        ))}
      </div>
    </div>
  );
}

function Step({ n, title, color, desc }) {
  return (
    <div className="flex items-start gap-6">
      <span className={`font-mono text-title-sm ${color} flex-shrink-0 w-8`}>{n}</span>
      <div>
        <h3 className={`text-title-sm ${color} mb-1`}>{title}</h3>
        <p className="text-body-lg text-enter-gray-400">{desc}</p>
      </div>
    </div>
  );
}
