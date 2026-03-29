import { useState } from 'react';
import { ChevronRight, ChevronLeft, BarChart3, Search, Brain, Target, MessageSquare, Presentation as PresentationIcon, Database, Scale, Clock, TrendingUp, Users, Building2, Zap } from 'lucide-react';

const SLIDES = [
  {
    id: 'hero',
    component: HeroSlide,
  },
  {
    id: 'context',
    component: ContextSlide,
  },
  {
    id: 'challenge',
    component: ChallengeSlide,
  },
  {
    id: 'methodology',
    component: MethodologySlide,
  },
  {
    id: 'data',
    component: DataSlide,
  },
  {
    id: 'pipeline',
    component: PipelineSlide,
  },
];

export default function Presentation({ onEnterPlatform }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goNext = () => {
    if (currentSlide < SLIDES.length - 1) setCurrentSlide(currentSlide + 1);
  };
  const goPrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const SlideComponent = SLIDES[currentSlide].component;
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <div className="min-h-screen bg-enter-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-enter-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-enter-gold rounded-enter flex items-center justify-center">
            <BarChart3 className="w-4.5 h-4.5 text-enter-black" />
          </div>
          <span className="text-sm font-bold text-enter-white uppercase tracking-wider">Enter</span>
          <span className="text-[10px] text-enter-gray-500 uppercase tracking-widest">Sales Intelligence</span>
        </div>
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentSlide ? 'bg-enter-gold w-6' : i < currentSlide ? 'bg-enter-gold/40' : 'bg-enter-gray-700'
              }`}
            />
          ))}
        </div>
        <button
          onClick={onEnterPlatform}
          className="text-xs text-enter-gray-500 hover:text-enter-gold transition-colors cursor-pointer uppercase tracking-wider"
        >
          Pular para plataforma →
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-5xl animate-fadeIn" key={currentSlide}>
          <SlideComponent onEnterPlatform={onEnterPlatform} />
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-8 py-4 border-t border-enter-gray-800/50">
        <button
          onClick={goPrev}
          disabled={currentSlide === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-enter text-sm font-medium transition-colors cursor-pointer ${
            currentSlide === 0 ? 'text-enter-gray-700 cursor-not-allowed' : 'text-enter-gray-400 hover:text-enter-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <span className="text-xs text-enter-gray-600 font-mono">
          {currentSlide + 1} / {SLIDES.length}
        </span>

        {isLast ? (
          <button onClick={onEnterPlatform} className="enter-btn-gold flex items-center gap-2">
            Entrar na Plataforma <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-4 py-2 bg-enter-gray-800 text-enter-white rounded-enter text-sm font-medium hover:bg-enter-gray-700 transition-colors cursor-pointer"
          >
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── SLIDE 1: HERO ───
function HeroSlide() {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-enter-gold/10 border border-enter-gold/20 rounded-full mb-6">
          <span className="text-xs font-semibold text-enter-gold uppercase tracking-wider">Case Growth Summer 2026</span>
        </div>
        <h1 className="text-5xl font-bold text-enter-white mb-4 leading-tight">
          Sales Intelligence para<br />
          <span className="text-enter-gold">Contencioso Trabalhista</span>
        </h1>
        <p className="text-lg text-enter-gray-400 max-w-2xl mx-auto leading-relaxed">
          Como identificar, qualificar e priorizar empresas com potencial de contencioso
          trabalhista suficiente para justificar contratos de US$500k+/ano
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
        <StatCard icon={Building2} value="36" label="Empresas analisadas" />
        <StatCard icon={Scale} value="R$50.6B" label="Pago em ações trabalhistas (2025)" />
        <StatCard icon={TrendingUp} value="2.4M" label="Novos casos/ano no Brasil" />
      </div>
    </div>
  );
}

// ─── SLIDE 2: CONTEXT ───
function ContextSlide() {
  return (
    <div>
      <SectionLabel>Contexto</SectionLabel>
      <h2 className="text-3xl font-bold text-enter-white mb-8">
        A Enter e a oportunidade <span className="text-enter-gold">trabalhista</span>
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="enter-card p-6">
          <h3 className="text-enter-gold font-semibold mb-3">O que a Enter faz</h3>
          <p className="text-enter-gray-300 text-sm leading-relaxed mb-4">
            Gestão de contencioso de massa com IA. Agentes de IA cobrem todo o ciclo:
            intake, análise de documentos, detecção de fraude, contestação automatizada,
            recomendação de acordo e avaliação de recurso.
          </p>
          <div className="flex items-center gap-2 text-xs text-enter-gray-500">
            <span className="enter-badge bg-verdict-qualified-bg text-verdict-qualified">$35M Series A</span>
            <span className="enter-badge bg-enter-gray-800 text-enter-gray-400">Founders Fund + Sequoia</span>
          </div>
        </div>

        <div className="enter-card p-6">
          <h3 className="text-enter-gold font-semibold mb-3">A nova frente: Trabalhista</h3>
          <p className="text-enter-gray-300 text-sm leading-relaxed mb-4">
            Historicamente focada em litígios consumeristas, a Enter lança produto para
            contencioso trabalhista. Oportunidade de expansão na base atual de clientes
            (upsell) e prospecção de novos.
          </p>
          <div className="flex items-center gap-2 text-xs text-enter-gray-500">
            <span className="enter-badge bg-verdict-potential-bg text-verdict-potential">ARR mínimo: US$500k</span>
            <span className="enter-badge bg-enter-gray-800 text-enter-gray-400">Expansão de conta</span>
          </div>
        </div>
      </div>

      <div className="enter-card p-4 mt-6 flex items-center gap-4">
        <Zap className="w-5 h-5 text-enter-gold flex-shrink-0" />
        <p className="text-sm text-enter-gray-300">
          <span className="font-semibold text-enter-white">Resultados comprovados:</span>{' '}
          BMG +7% win rate em 5.000 contestações AI. LATAM +30% win rate. SulAmérica 30.000 casos analisados de 500.000 documentos.
        </p>
      </div>
    </div>
  );
}

// ─── SLIDE 3: CHALLENGE ───
function ChallengeSlide() {
  return (
    <div>
      <SectionLabel>O Desafio</SectionLabel>
      <h2 className="text-3xl font-bold text-enter-white mb-8">
        4 perguntas que <span className="text-enter-gold">precisam de resposta</span>
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {[
          { n: '01', title: 'Qualificação', desc: 'Como identificar empresas com volume trabalhista suficiente para US$500k/ano?', icon: Search, color: 'text-blue-400' },
          { n: '02', title: 'Priorização', desc: 'Quais clientes da base atacar primeiro e por quê?', icon: Target, color: 'text-verdict-qualified' },
          { n: '03', title: 'Discovery', desc: 'Que perguntas fazer ao cliente #1 para mapear a dor?', icon: MessageSquare, color: 'text-enter-gold' },
          { n: '04', title: 'Pitch CFO', desc: 'Como comunicar valor, criar urgência e diferenciar a Enter?', icon: PresentationIcon, color: 'text-orange-400' },
        ].map(({ n, title, desc, icon: Icon, color }) => (
          <div key={n} className="enter-card p-5 flex gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono text-enter-gray-600">{n}</span>
              <Icon className={`w-5 h-5 ${color} mt-1`} />
            </div>
            <div>
              <h3 className="font-semibold text-enter-white mb-1">{title}</h3>
              <p className="text-sm text-enter-gray-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="enter-card p-4 mt-6 text-center">
        <p className="text-sm text-enter-gray-400">
          Em vez de responder num PowerPoint,{' '}
          <span className="font-semibold text-enter-gold">construí uma plataforma que faz tudo isso automaticamente</span>{' '}
          com dados reais e IA.
        </p>
      </div>
    </div>
  );
}

// ─── SLIDE 4: METHODOLOGY ───
function MethodologySlide() {
  return (
    <div>
      <SectionLabel>Metodologia</SectionLabel>
      <h2 className="text-3xl font-bold text-enter-white mb-8">
        Score composto em <span className="text-enter-gold">3 dimensões</span>
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <DimensionCard
          title="Volume" weight="30%" color="bg-blue-500"
          items={[
            'Funcionários × taxa de litígio do setor',
            'Calibrado com TST Ranking (Bradesco 88% accuracy)',
            'Banking: 100 casos/1k func/ano',
          ]}
        />
        <DimensionCard
          title="Complexidade" weight="40%" color="bg-enter-gold"
          items={[
            'Presença estadual (contagem UFs)',
            'Disputa sindical ativa (sim/não)',
            'Risco de terceirização (setor)',
            'Empresa de capital aberto (B3/SEC)',
            'Complexidade regulatória do setor',
          ]}
          badge="100% verificável"
        />
        <DimensionCard
          title="Timing" weight="30%" color="bg-orange-500"
          items={[
            'Layoffs recentes (últimos 24 meses)',
            'M&A / fusões e aquisições',
            'Reestruturação corporativa',
            'Privatização',
          ]}
        />
      </div>

      <div className="enter-card p-4 flex items-center gap-4">
        <Brain className="w-5 h-5 text-enter-gold flex-shrink-0" />
        <p className="text-sm text-enter-gray-300">
          <span className="font-semibold text-enter-white">Karpathy Loop:</span>{' '}
          O modelo foi calibrado iterativamente contra dados reais do TST. Bradesco: estimativa 8.402 vs real ~9.600 casos/ano (88% accuracy).
        </p>
      </div>
    </div>
  );
}

// ─── SLIDE 5: DATA SOURCES ───
function DataSlide() {
  return (
    <div>
      <SectionLabel>Fontes de Dados</SectionLabel>
      <h2 className="text-3xl font-bold text-enter-white mb-8">
        Dados <span className="text-enter-gold">reais</span>, não estimativas
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {[
          { source: 'TST Ranking das Partes', desc: 'Casos novos/mês por empresa no Tribunal Superior do Trabalho. Bradesco: 716/mês, Itaú: 600/mês.', badge: 'Oficial', color: 'text-verdict-qualified' },
          { source: 'CNJ Justiça em Números 2025', desc: '2.4M novos casos/ano. R$50.6B pagos por empresas. Setor serviços: 27.9%, indústria: 20.6%.', badge: 'Oficial', color: 'text-verdict-qualified' },
          { source: 'DIEESE / CAGED', desc: 'Turnover bancário: 25% (57.8% employer-initiated). Call center: 40%/ano.', badge: 'Oficial', color: 'text-verdict-qualified' },
          { source: 'CVM / SEC Filings', desc: 'Employee counts verificados. Magalu: R$173M provisão trabalhista (Formulário Referência 2025).', badge: 'Oficial', color: 'text-verdict-qualified' },
          { source: 'Sindicatos & Notícias', desc: 'Contraf-CUT, SNA, SINTETEL. Disputas sindicais recentes verificadas para cada empresa.', badge: 'Verificável', color: 'text-enter-gold' },
          { source: 'Perplexity Sonar Pro', desc: 'Web search em tempo real para cada empresa. Busca headcount, layoffs, litígios, CNJ.', badge: 'AI + Web', color: 'text-blue-400' },
        ].map(({ source, desc, badge, color }) => (
          <div key={source} className="enter-card p-4 flex gap-3">
            <Database className={`w-4 h-4 ${color} mt-0.5 flex-shrink-0`} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-enter-white">{source}</h4>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${color} bg-enter-gray-800`}>{badge}</span>
              </div>
              <p className="text-xs text-enter-gray-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SLIDE 6: PIPELINE ───
function PipelineSlide({ onEnterPlatform }) {
  return (
    <div className="text-center">
      <SectionLabel>A Plataforma</SectionLabel>
      <h2 className="text-3xl font-bold text-enter-white mb-4">
        Pipeline de <span className="text-enter-gold">Sales Intelligence</span>
      </h2>
      <p className="text-enter-gray-400 mb-10 max-w-2xl mx-auto">
        Selecione qualquer empresa da base Enter e o sistema executa o pipeline completo automaticamente.
      </p>

      <div className="flex items-center justify-center gap-3 mb-12">
        {[
          { step: '1', label: 'Dashboard', desc: '36 empresas rankeadas', icon: BarChart3 },
          { step: '2', label: 'Qualificação', desc: 'Web search + score', icon: Search },
          { step: '3', label: 'Discovery', desc: '8 perguntas categorizadas', icon: MessageSquare },
          { step: '4', label: 'Pitch CFO', desc: '3 parágrafos personalizados', icon: PresentationIcon },
        ].map(({ step, label, desc, icon: Icon }, i) => (
          <div key={step} className="flex items-center gap-3">
            <div className="enter-card p-4 w-44 text-center">
              <div className="w-8 h-8 bg-enter-gold/10 rounded-enter flex items-center justify-center mx-auto mb-2">
                <Icon className="w-4 h-4 text-enter-gold" />
              </div>
              <div className="text-xs font-mono text-enter-gray-600 mb-1">Etapa {step}</div>
              <div className="text-sm font-semibold text-enter-white mb-0.5">{label}</div>
              <div className="text-[11px] text-enter-gray-500">{desc}</div>
            </div>
            {i < 3 && <ChevronRight className="w-4 h-4 text-enter-gray-700 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <button onClick={onEnterPlatform} className="enter-btn-gold text-base px-10 py-3">
        Entrar na Plataforma
      </button>
    </div>
  );
}

// ─── SHARED COMPONENTS ───
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4 bg-enter-gold rounded-full" />
      <span className="text-xs font-semibold text-enter-gold uppercase tracking-widest">{children}</span>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="enter-card p-5 text-center">
      <Icon className="w-5 h-5 text-enter-gold mx-auto mb-2" />
      <div className="text-2xl font-bold text-enter-white font-mono">{value}</div>
      <div className="text-xs text-enter-gray-500 mt-1">{label}</div>
    </div>
  );
}

function DimensionCard({ title, weight, color, items, badge }) {
  return (
    <div className="enter-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="font-semibold text-enter-white">{title}</h3>
        <span className="text-xs text-enter-gray-500 font-mono">({weight})</span>
      </div>
      {badge && (
        <div className="mb-3">
          <span className="enter-badge bg-verdict-qualified-bg text-verdict-qualified text-[10px]">{badge}</span>
        </div>
      )}
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-enter-gray-400 flex items-start gap-2">
            <span className="text-enter-gold mt-0.5">-</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
