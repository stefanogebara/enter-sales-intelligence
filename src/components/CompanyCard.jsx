import { Users, MapPin, Building2, ChevronRight } from 'lucide-react';
import ScoreBreakdown from './ScoreBreakdown';

const SEGMENT_COLORS = {
  'Financial Services': 'bg-blue-100 text-blue-700',
  'Tech': 'bg-violet-100 text-violet-700',
  'Retail': 'bg-orange-100 text-orange-700',
  'Airlines': 'bg-sky-100 text-sky-700',
  'Telecom': 'bg-teal-100 text-teal-700',
  'Healthcare': 'bg-rose-100 text-rose-700',
  'Utilities': 'bg-lime-100 text-lime-700',
  'Services': 'bg-slate-100 text-slate-700',
};

const VERDICT_STYLES = {
  QUALIFIED: 'border-emerald-200 hover:border-emerald-300',
  POTENTIAL: 'border-amber-200 hover:border-amber-300',
  NOT_QUALIFIED: 'border-red-200 hover:border-red-300',
};

const VERDICT_DOT = {
  QUALIFIED: 'bg-emerald-500',
  POTENTIAL: 'bg-amber-500',
  NOT_QUALIFIED: 'bg-red-400',
};

export default function CompanyCard({ company, onClick }) {
  const { score } = company;
  const segColor = SEGMENT_COLORS[company.segment] || 'bg-slate-100 text-slate-700';

  return (
    <button
      onClick={() => onClick(company)}
      className={`w-full text-left bg-white rounded-xl border-2 ${VERDICT_STYLES[score.verdict]} p-5 transition-all hover:shadow-md group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${VERDICT_DOT[score.verdict]}`} />
            <h3 className="font-semibold text-slate-900 truncate">{company.name}</h3>
          </div>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${segColor}`}>
            {company.segment}
          </span>
        </div>
        <div className="flex flex-col items-center ml-3">
          <span className="text-2xl font-bold font-mono text-slate-900">{score.total}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Score</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {company.employees.toLocaleString('pt-BR')}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {company.headquarters}
        </span>
      </div>

      {/* Score breakdown */}
      <ScoreBreakdown score={score} compact />

      {/* Estimated ARR */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">
            ~{score.estimatedCases} casos/ano
          </span>
          {' · '}
          ARR est. <span className="font-mono font-medium text-slate-700">
            US${(score.estimatedARR / 1000).toFixed(0)}k
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </button>
  );
}

export { SEGMENT_COLORS };
