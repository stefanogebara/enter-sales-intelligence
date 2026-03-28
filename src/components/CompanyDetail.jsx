import { useState } from 'react';
import { ArrowLeft, Users, MapPin, Building2, Briefcase, Clock, FileText, MessageSquare, Presentation, Loader2, Copy, Check } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import ScoreBreakdown from './ScoreBreakdown';

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: FileText },
  { id: 'qualify', label: 'Qualificação', icon: Briefcase },
  { id: 'discovery', label: 'Discovery', icon: MessageSquare },
  { id: 'pitch', label: 'Pitch CFO', icon: Presentation },
];

export default function CompanyDetail({ company, onBack, analysisState, onRunAnalysis }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      {/* Company header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{company.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                {company.segment}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {company.employees.toLocaleString('pt-BR')} funcionários
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {company.headquarters}
              </span>
            </div>
          </div>
          <ScoreGauge score={company.score} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === id
                ? 'bg-navy-800 text-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id !== 'overview' && analysisState[id]?.data && (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {activeTab === 'overview' && <OverviewTab company={company} />}
        {activeTab === 'qualify' && (
          <AIPanel
            type="qualify"
            title="Qualificação com Dados Reais"
            description="Análise aprofundada via Claude AI com pesquisa web em tempo real. Busca dados de headcount, litígios trabalhistas, notícias de layoffs e benchmarks do CNJ."
            buttonLabel="Analisar Empresa"
            state={analysisState.qualify}
            onRun={() => onRunAnalysis('qualify')}
          />
        )}
        {activeTab === 'discovery' && (
          <AIPanel
            type="discovery"
            title="Roteiro de Discovery"
            description="Gera 8 perguntas direcionadas para o diretor jurídico/RH, categorizadas por Dor, Processo, Budget e Decisão."
            buttonLabel="Gerar Perguntas"
            state={analysisState.discovery}
            onRun={() => onRunAnalysis('discovery')}
          />
        )}
        {activeTab === 'pitch' && (
          <AIPanel
            type="pitch"
            title="Pitch para o CFO"
            description="3 parágrafos em português, personalizados com dados reais da empresa, criando urgência e diferenciando a Enter."
            buttonLabel="Gerar Pitch"
            state={analysisState.pitch}
            onRun={() => onRunAnalysis('pitch')}
          />
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
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Score Breakdown</h3>
        <ScoreBreakdown score={score} />

        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">Estimativas</h4>
          <StatRow label="Casos trabalhistas/ano" value={`~${score.estimatedCases}`} />
          <StatRow label="Custo anual estimado" value={`R$ ${(score.estimatedAnnualCostBRL / 1e6).toFixed(1)}M`} />
          <StatRow label="ARR potencial (Enter)" value={`US$ ${(score.estimatedARR / 1000).toFixed(0)}k`} />
          <StatRow label="Separações/ano" value={`~${score.annualSeparations.toLocaleString('pt-BR')}`} />
          <StatRow label="Taxa de turnover" value={`${(score.turnoverRate * 100).toFixed(0)}%`} />
          <StatRow label="Benchmark CNJ" value={`${score.cnjRate} casos/1k func./ano`} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Fatores de Risco</h3>
        <div className="space-y-4">
          <FactorSection title="Complexidade" factors={[
            { label: 'Diversidade de cargos', value: score.complexityFactors.cargoDiversity, max: 10 },
            { label: 'Presença multiestadual', value: score.complexityFactors.multiState, max: 10 },
            { label: 'Atividade sindical', value: score.complexityFactors.unionActivity, max: 10 },
            { label: 'Ratio operacional', value: score.complexityFactors.operationalRatio, max: 10 },
            { label: 'Variância de senioridade', value: score.complexityFactors.seniorityVariance, max: 10 },
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

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-mono font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function FactorSection({ title, factors }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-2">{title}</h4>
      <div className="space-y-2">
        {factors.map(({ label, value, max }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-40 truncate">{label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-navy-700 rounded-full h-1.5 transition-all"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-600 w-8 text-right">{value}/{max}</span>
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
        <Loader2 className="w-8 h-8 text-enter-blue animate-spin mb-4" />
        <p className="text-sm text-slate-500">
          {type === 'qualify' && 'Pesquisando dados da empresa...'}
          {type === 'discovery' && 'Gerando perguntas de discovery...'}
          {type === 'pitch' && 'Escrevendo pitch para o CFO...'}
        </p>
        <p className="text-xs text-slate-400 mt-1">Isso pode levar 30-60 segundos</p>
      </div>
    );
  }

  if (state?.error) {
    return (
      <div className="py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
        <button
          onClick={onRun}
          className="px-4 py-2 bg-navy-800 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (state?.data) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
          {state.data}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 text-center max-w-md mb-6">{description}</p>
      <button
        onClick={onRun}
        className="px-6 py-2.5 bg-navy-800 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors shadow-sm"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
