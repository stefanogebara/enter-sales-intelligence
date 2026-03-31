import { useState, useEffect } from 'react';
import { ArrowLeft, Users, MapPin, Building2, Briefcase, MessageSquare, Presentation, Loader2, Copy, Check, Zap, Database } from 'lucide-react';
import Markdown from 'react-markdown';
import ScoreGauge from './ScoreGauge';
import ScoreBreakdown from './ScoreBreakdown';

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: Building2 },
  { id: 'qualify', label: 'Qualificação', icon: Briefcase },
  { id: 'discovery', label: 'Discovery', icon: MessageSquare },
  { id: 'pitch', label: 'Pitch CFO', icon: Presentation },
  { id: 'simulate', label: 'Simulação', icon: Zap },
];

export default function CompanyDetail({ company, onBack, analysisState, onRunAnalysis }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-enter-gray-500 hover:text-enter-gold mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      {/* Header */}
      <div className="enter-card p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-enter-white mb-2">{company.name}</h1>
            <div className="flex items-center gap-4 text-sm text-enter-gray-400">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{company.segment}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{company.employees.toLocaleString('pt-BR')} funcionários</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{company.headquarters}</span>
            </div>
            {company.score.meetsARRThreshold && (
              <div className="mt-3">
                <span className="enter-badge bg-enter-gold/10 text-enter-gold border border-enter-gold/20">
                  Atinge threshold US$500k ARR
                </span>
              </div>
            )}
          </div>
          <ScoreGauge score={company.score} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 bg-enter-gray-900 border border-enter-gray-800 rounded-enter p-1 mb-4">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-enter text-sm font-medium transition-colors flex-1 justify-center cursor-pointer ${
              activeTab === id
                ? 'bg-enter-gold text-enter-black'
                : 'text-enter-gray-500 hover:text-enter-white hover:bg-enter-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id !== 'overview' && analysisState[id]?.data && (
              <Check className={`w-3.5 h-3.5 ${activeTab === id ? 'text-enter-black/60' : 'text-verdict-qualified'}`} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="enter-card p-6">
        {activeTab === 'overview' && <OverviewTab company={company} />}
        {activeTab === 'qualify' && (
          <div>
            <AIPanel type="qualify" title="Qualificação com Dados Reais"
              description="Análise via Perplexity Sonar Pro com pesquisa web. Busca headcount real, Glassdoor, litígios trabalhistas e jurimetria."
              buttonLabel="Analisar Empresa" state={analysisState.qualify} onRun={() => onRunAnalysis('qualify')} />
            {analysisState.qualify?.enrichedScore && (
              <EnrichedScoreBanner score={analysisState.qualify.enrichedScore} />
            )}
          </div>
        )}
        {activeTab === 'discovery' && (
          <AIPanel type="discovery" title="Roteiro de Discovery"
            description="Gera 8 perguntas direcionadas para o diretor jurídico/RH, categorizadas por Dor, Processo, Budget e Decisão."
            buttonLabel="Gerar Perguntas" state={analysisState.discovery} onRun={() => onRunAnalysis('discovery')} />
        )}
        {activeTab === 'pitch' && (
          <AIPanel type="pitch" title="Pitch para o CFO"
            description="3 parágrafos em português, personalizados com dados reais da empresa, criando urgência e diferenciando a Enter."
            buttonLabel="Gerar Pitch" state={analysisState.pitch} onRun={() => onRunAnalysis('pitch')} />
        )}
        {activeTab === 'simulate' && (
          <SimulationPanel state={analysisState.simulate} onRun={() => onRunAnalysis('simulate')} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ company }) {
  const { score } = company;
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-base font-semibold text-enter-white mb-4">Score Breakdown</h3>
        <ScoreBreakdown score={score} />
        <div className="mt-6 space-y-2">
          <h4 className="text-xs font-semibold text-enter-gray-400 uppercase tracking-wider mb-3">Estimativas</h4>
          <StatRow label="Casos trabalhistas/ano" value={`~${score.estimatedCases.toLocaleString('pt-BR')}`} />
          <StatRow label="Custo anual estimado" value={`R$ ${(score.estimatedAnnualCostBRL / 1e6).toFixed(1)}M`} />
          <StatRow label="ARR potencial (Enter)" value={`US$ ${(score.estimatedARR / 1000).toFixed(0)}k`} highlight={score.meetsARRThreshold} />
          <StatRow label="Separações/ano" value={`~${score.annualSeparations.toLocaleString('pt-BR')}`} />
          <StatRow label="Taxa de turnover" value={`${(score.turnoverRate * 100).toFixed(0)}%`} />
          <StatRow label="Taxa litígio setor" value={`${score.litigationRate} casos/1k func./ano`} />
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold text-enter-white mb-4">Fatores de Risco</h3>
        <div className="space-y-5">
          <FactorSection title="Complexidade (verificável)" factors={[
            { label: 'Presença estadual', value: score.complexityFactors.presencaEstadual, max: 10 },
            { label: 'Atividade sindical', value: score.complexityFactors.atividadeSindical, max: 10 },
            { label: 'Risco terceirização', value: score.complexityFactors.riscoTerceirizacao, max: 10 },
            { label: 'Empresa aberta (B3/SEC)', value: score.complexityFactors.empresaAberta, max: 10 },
            { label: 'Complexidade do setor', value: score.complexityFactors.complexidadeSetor, max: 10 },
          ]} />
          <FactorSection title="Timing" factors={[
            { label: 'Layoffs recentes', value: score.timingFactors.recentLayoffs, max: 10 },
            { label: 'M&A', value: score.timingFactors.mAndA, max: 10 },
            { label: 'Reestruturação', value: score.timingFactors.restructuring, max: 10 },
            { label: 'Privatização', value: score.timingFactors.privatization, max: 10 },
          ]} />
        </div>
      </div>

      {/* DataJud CNJ Section */}
      <div className="col-span-2 mt-6 pt-6 border-t border-enter-gray-800">
        <DataJudSection />
      </div>
    </div>
  );
}

function DataJudSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/datajud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region: 'trt2' }),
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  if (!data && !loading) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-enter-gold" />
          <div>
            <p className="text-sm font-semibold text-enter-white">DataJud / CNJ</p>
            <p className="text-xs text-enter-gray-500">237M+ processos — dados reais da Justiça do Trabalho</p>
          </div>
        </div>
        <button onClick={load} className="font-mono text-xs uppercase text-enter-gold border border-enter-gold/30 px-4 py-2 rounded-enter hover:bg-enter-gold/10 transition-colors cursor-pointer">
          Carregar dados
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-enter-gold animate-spin" />
        <p className="text-xs text-enter-gray-500">Consultando DataJud/CNJ...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-4 h-4 text-enter-gold" />
        <h4 className="text-xs font-semibold text-enter-gold uppercase tracking-wider">
          DataJud / CNJ — {data.region} (São Paulo)
        </h4>
        <span className="text-[10px] text-enter-gray-600 font-mono">tempo real</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Top subjects */}
        <div className="col-span-2">
          <p className="text-xs text-enter-gray-500 mb-2">Principais assuntos trabalhistas</p>
          <div className="space-y-1.5">
            {data.topSubjects?.slice(0, 6).map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-enter-gray-300 flex-1 truncate">{s.name}</span>
                <div className="w-32 bg-enter-gray-800 rounded-full h-1">
                  <div className="bg-enter-gold rounded-full h-1" style={{ width: `${(s.count / (data.topSubjects[0]?.count || 1)) * 100}%` }} />
                </div>
                <span className="text-xs font-mono text-enter-gray-400 w-20 text-right">{(s.count / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        {/* Case types */}
        <div>
          <p className="text-xs text-enter-gray-500 mb-2">Tipos de ação</p>
          <div className="space-y-1.5">
            {data.caseTypes?.slice(0, 4).map((c, i) => (
              <div key={i}>
                <span className="text-xs text-enter-gray-300">{c.name.replace('Trabalhista', 'Trab.').replace('Ordinário', 'Ord.').replace('Sumaríssimo', 'Sum.')}</span>
                <span className="text-xs font-mono text-enter-gray-500 ml-2">{(c.count / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-enter-gray-600 mt-3">Fonte: {data.source}</p>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-enter-gray-800">
      <span className="text-sm text-enter-gray-500">{label}</span>
      <span className={`text-sm font-mono font-semibold ${highlight ? 'text-enter-gold' : 'text-enter-white'}`}>{value}</span>
    </div>
  );
}

function FactorSection({ title, factors }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-enter-gray-400 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-2">
        {factors.map(({ label, value, max }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-enter-gray-500 w-40 truncate">{label}</span>
            <div className="flex-1 bg-enter-gray-800 rounded-full h-1">
              <div
                className="bg-enter-gold rounded-full h-1 transition-all"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-enter-gray-400 w-8 text-right">{value}/{max}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnrichedScoreBanner({ score }) {
  const up = score.adjustment > 0;
  const neutral = score.adjustment === 0;
  const color = up ? 'text-verdict-qualified' : neutral ? 'text-enter-gray-400' : 'text-blue-400';
  const arrow = up ? '↑' : neutral ? '→' : '↓';
  const verdictColor = {
    QUALIFIED: 'bg-verdict-qualified-bg text-verdict-qualified',
    POTENTIAL: 'bg-verdict-potential-bg text-verdict-potential',
    NOT_QUALIFIED: 'bg-verdict-unqualified-bg text-verdict-unqualified',
  }[score.verdict] || '';

  return (
    <div className="mt-4 enter-card p-4 border-enter-gold/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Zap className="w-4 h-4 text-enter-gold" />
          <span className="text-sm font-semibold text-enter-white">Score Enriquecido</span>
        </div>
        <span className={`enter-badge ${verdictColor}`}>{score.verdict === 'QUALIFIED' ? 'Qualificado' : score.verdict === 'POTENTIAL' ? 'Potencial' : 'Não Qualificado'}</span>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <p className="text-xs text-enter-gray-500">Estimado</p>
          <p className="text-xl font-mono text-enter-gray-400">{score.baseTotal}</p>
        </div>
        <span className={`text-2xl font-mono ${color}`}>{arrow}</span>
        <div className="text-center">
          <p className="text-xs text-enter-gold">Enriquecido</p>
          <p className="text-xl font-mono text-enter-white font-bold">{score.total}</p>
        </div>
        <span className={`text-sm font-mono ${color}`}>({up ? '+' : ''}{score.adjustment})</span>
      </div>

      {score.factors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {score.factors.map((f, i) => (
            <span key={i} className="enter-badge bg-enter-gray-800 text-enter-gray-300 text-[10px]">{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function SimulationPanel({ state, onRun }) {
  if (state?.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-enter-gold animate-spin mb-4" />
        <p className="text-sm text-enter-gray-400">Gerando 5 perspectivas em paralelo...</p>
        <p className="text-xs text-enter-gray-600 mt-1">CFO · Jurídico · RH · Sindicato · Conselho</p>
      </div>
    );
  }

  if (state?.error) {
    return (
      <div className="py-8">
        <div className="bg-verdict-unqualified-bg border border-verdict-unqualified/20 rounded-enter p-4 mb-4">
          <p className="text-sm text-verdict-unqualified">{state.error}</p>
        </div>
        <button onClick={onRun} className="font-mono text-label uppercase border border-enter-white text-enter-white px-6 py-3 rounded-enter hover:bg-enter-white hover:text-enter-black transition-colors cursor-pointer">Tentar novamente</button>
      </div>
    );
  }

  if (state?.data?.personas) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-enter-white">Simulação Multi-Stakeholder</h3>
            <p className="text-caption text-enter-gray-500 mt-1">
              Round 1: análise independente · Round 2: reação aos outros · Síntese: consenso e conflitos
            </p>
          </div>
        </div>

        {/* Personas */}
        <div className="space-y-4 mb-6">
          {state.data.personas.map((p) => (
            <div key={p.id} className="enter-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-enter flex items-center justify-center text-[10px] font-mono font-bold text-enter-black" style={{ backgroundColor: p.color }}>
                  {p.label}
                </div>
                <span className="text-sm font-semibold text-enter-white">{p.title}</span>
              </div>
              <p className="text-body-lg text-enter-gray-300 leading-relaxed">{p.text}</p>
              {p.reaction && (
                <div className="mt-3 pt-3 border-t border-enter-gray-800">
                  <p className="text-xs font-mono text-enter-gray-500 uppercase mb-1">Reação (Round 2)</p>
                  <p className="text-sm text-enter-gray-400 italic">{p.reaction}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Synthesis */}
        {state.data.synthesis && (
          <div className="enter-card p-5 border-enter-gold/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-enter-gold" />
              <span className="text-sm font-semibold text-enter-gold">Síntese</span>
            </div>
            <div className="prose prose-sm prose-invert max-w-none prose-headings:text-enter-gold prose-headings:text-sm prose-headings:mb-1 prose-p:text-enter-gray-300 prose-p:text-sm prose-p:leading-relaxed">
              <Markdown>{state.data.synthesis}</Markdown>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h3 className="text-base font-semibold text-enter-white mb-2">Simulação Multi-Stakeholder</h3>
      <p className="text-sm text-enter-gray-500 text-center max-w-md mb-3">
        Gera 5 perspectivas simultâneas sobre o cenário trabalhista da empresa:
        CFO, Diretor Jurídico, RH, Líder Sindical e Membro do Conselho.
      </p>
      <p className="text-xs text-enter-gray-600 text-center max-w-md mb-6">
        Inspirado em simulação multi-agente — cada persona analisa o mesmo cenário
        com prioridades e preocupações diferentes.
      </p>
      <button onClick={onRun} className="font-mono text-label uppercase border border-enter-gold text-enter-gold px-8 py-3 rounded-enter hover:bg-enter-gold hover:text-enter-black transition-colors cursor-pointer">
        Rodar Simulação
      </button>
    </div>
  );
}

function AIPanel({ type, title, description, buttonLabel, state, onRun }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(state.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state?.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-enter-gold animate-spin mb-4" />
        <p className="text-sm text-enter-gray-400">
          {type === 'qualify' && 'Pesquisando dados da empresa via Perplexity...'}
          {type === 'discovery' && 'Gerando perguntas de discovery via Claude...'}
          {type === 'pitch' && 'Escrevendo pitch para o CFO via Claude...'}
        </p>
        <p className="text-xs text-enter-gray-600 mt-1">Isso pode levar 15-30 segundos</p>
      </div>
    );
  }

  if (state?.error) {
    return (
      <div className="py-8">
        <div className="bg-verdict-unqualified-bg border border-verdict-unqualified/20 rounded-enter p-4 mb-4">
          <p className="text-sm text-verdict-unqualified">{state.error}</p>
        </div>
        <button onClick={onRun} className="enter-btn-primary">Tentar novamente</button>
      </div>
    );
  }

  if (state?.data) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-enter-white">{title}</h3>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-enter-gray-500 hover:text-enter-gold transition-colors cursor-pointer">
            {copied ? <Check className="w-3.5 h-3.5 text-verdict-qualified" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <div className="prose prose-sm prose-invert max-w-none
          prose-headings:text-enter-gold prose-headings:font-semibold prose-headings:border-b prose-headings:border-enter-gray-800 prose-headings:pb-2 prose-headings:mb-3
          prose-h2:text-base prose-h3:text-sm
          prose-strong:text-enter-white
          prose-p:text-enter-gray-300 prose-p:leading-relaxed
          prose-li:text-enter-gray-300
          prose-a:text-enter-gold prose-a:no-underline hover:prose-a:underline
          prose-em:text-enter-gray-400
          prose-code:text-enter-gold prose-code:bg-enter-gray-800 prose-code:px-1 prose-code:rounded
        ">
          <Markdown>{state.data}</Markdown>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h3 className="text-base font-semibold text-enter-white mb-2">{title}</h3>
      <p className="text-sm text-enter-gray-500 text-center max-w-md mb-6">{description}</p>
      <button onClick={onRun} className="enter-btn-gold">{buttonLabel}</button>
    </div>
  );
}
