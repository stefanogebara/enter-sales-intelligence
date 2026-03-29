const BARS = [
  { key: 'volume', label: 'Volume', weight: '30%', color: 'bg-blue-500', desc: 'Funcionários × Taxa de Litígio' },
  { key: 'complexity', label: 'Complexidade', weight: '40%', color: 'bg-enter-gold', desc: 'Cargos, estados, sindicatos' },
  { key: 'timing', label: 'Timing', weight: '30%', color: 'bg-orange-500', desc: 'Layoffs, M&A, reestruturação' },
];

export default function ScoreBreakdown({ score, compact = false }) {
  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      {BARS.map(({ key, label, weight, color, desc }) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1">
            <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'} text-enter-gray-300`}>
              {label} <span className="text-enter-gray-500 font-normal">({weight})</span>
            </span>
            <span className={`font-mono font-semibold ${compact ? 'text-xs' : 'text-sm'} text-enter-white`}>
              {score[key]}
            </span>
          </div>
          <div className={`w-full bg-enter-gray-800 rounded-full ${compact ? 'h-1' : 'h-1.5'}`}>
            <div
              className={`${color} rounded-full ${compact ? 'h-1' : 'h-1.5'} transition-all duration-700`}
              style={{ width: `${score[key]}%` }}
            />
          </div>
          {!compact && (
            <p className="text-xs text-enter-gray-500 mt-0.5">{desc}</p>
          )}
        </div>
      ))}
    </div>
  );
}
