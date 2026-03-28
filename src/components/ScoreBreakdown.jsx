const BARS = [
  { key: 'volume', label: 'Volume', weight: '30%', color: 'bg-blue-500', desc: 'Funcionários x Turnover' },
  { key: 'complexity', label: 'Complexidade', weight: '40%', color: 'bg-purple-500', desc: 'Cargos, estados, sindicatos' },
  { key: 'timing', label: 'Timing', weight: '30%', color: 'bg-orange-500', desc: 'Layoffs, M&A, reestruturação' },
];

export default function ScoreBreakdown({ score, compact = false }) {
  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      {BARS.map(({ key, label, weight, color, desc }) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1">
            <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'} text-slate-700`}>
              {label} <span className="text-slate-400 font-normal">({weight})</span>
            </span>
            <span className={`font-mono font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
              {score[key]}
            </span>
          </div>
          <div className={`w-full bg-slate-200 rounded-full ${compact ? 'h-1.5' : 'h-2'}`}>
            <div
              className={`${color} rounded-full ${compact ? 'h-1.5' : 'h-2'} transition-all duration-700`}
              style={{ width: `${score[key]}%` }}
            />
          </div>
          {!compact && (
            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
          )}
        </div>
      ))}
    </div>
  );
}
