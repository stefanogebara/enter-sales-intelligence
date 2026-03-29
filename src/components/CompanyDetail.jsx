import { useState } from 'react';
import { ArrowLeft, Users, MapPin, Building2, Briefcase, MessageSquare, Presentation, Loader2, Copy, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import ScoreGauge from './ScoreGauge';
import ScoreBreakdown from './ScoreBreakdown';

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: Building2 },
  { id: 'qualify', label: 'Qualificação', icon: Briefcase },
  { id: 'discovery', label: 'Discovery', icon: MessageSquare },
  { id: 'pitch', label: 'Pitch CFO', icon: Presentation },
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
          <AIPanel type="qualify" title="Qualificação com Dados Reais"
            description="Análise via Perplexity Sonar Pro com pesquisa web. Busca headcount real, litígios trabalhistas, notícias de layoffs e benchmarks do CNJ."
            buttonLabel="Analisar Empresa" state={analysisState.qualify} onRun={() => onRunAnalysis('qualify')} />
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
