import { Users, MapPin, ChevronRight } from 'lucide-react';
import ScoreBreakdown from './ScoreBreakdown';

const SEGMENT_COLORS = {
  'Financial Services': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Tech': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Retail': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Airlines': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Telecom': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Healthcare': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Utilities': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Services': 'bg-enter-gold/10 text-enter-gold border-enter-gold/20',
};

const VERDICT_BORDER = {
  QUALIFIED: 'border-verdict-qualified/30 hover:border-verdict-qualified/60',
  POTENTIAL: 'border-verdict-potential/30 hover:border-verdict-potential/60',
  NOT_QUALIFIED: 'border-enter-gray-800 hover:border-enter-gray-600',
};

const VERDICT_DOT = {
  QUALIFIED: 'bg-verdict-qualified',
  POTENTIAL: 'bg-verdict-potential',
  NOT_QUALIFIED: 'bg-verdict-unqualified',
};

export default function CompanyCard({ company, onClick }) {
  const { score } = company;
  const segColor = SEGMENT_COLORS[company.segment] || 'bg-enter-gray-800 text-enter-gray-400 border-enter-gray-700';

  return (
    <button
      onClick={() => onClick(company)}
      className={`w-full text-left bg-enter-gray-900 rounded-enter border ${VERDICT_BORDER[score.verdict]} p-5 transition-all duration-200 hover:bg-enter-gray-800 cursor-pointer group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${VERDICT_DOT[score.verdict]}`} />
            <h3 className="font-semibold text-enter-white truncate">{company.name}</h3>
          </div>
          <span className={`enter-badge border ${segColor}`}>
            {company.segment}
          </span>
        </div>
        <div className="flex flex-col items-center ml-3">
          <span className="text-2xl font-bold font-mono text-enter-white">{score.total}</span>
          <span className="text-[9px] text-enter-gray-500 uppercase tracking-widest">Score</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-enter-gray-500 mb-3">
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

      {/* Bottom stats */}
      <div className="mt-3 pt-3 border-t border-enter-gray-800 flex items-center justify-between">
        <div className="text-xs text-enter-gray-500">
          <span className="font-medium text-enter-gray-300">
            ~{score.estimatedCases.toLocaleString('pt-BR')} casos/ano
          </span>
          {' · '}
          ARR est. <span className="font-mono font-medium text-enter-gold">
            US${(score.estimatedARR / 1000).toFixed(0)}k
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-enter-gray-600 group-hover:text-enter-gold transition-colors" />
      </div>
    </button>
  );
}

export { SEGMENT_COLORS };
