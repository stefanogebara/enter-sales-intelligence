import { useEffect, useState } from 'react';

const VERDICT_COLORS = {
  QUALIFIED: { stroke: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Qualificado' },
  POTENTIAL: { stroke: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Potencial' },
  NOT_QUALIFIED: { stroke: '#EF4444', bg: 'bg-red-50', text: 'text-red-700', label: 'Não Qualificado' },
};

export default function ScoreGauge({ score, size = 120, strokeWidth = 8 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const colors = VERDICT_COLORS[score.verdict] || VERDICT_COLORS.NOT_QUALIFIED;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score.total), 100);
    return () => clearTimeout(timer);
  }, [score.total]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-gauge-circle"
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold font-mono" style={{ color: colors.stroke }}>
            {score.total}
          </span>
        </div>
      </div>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
        {colors.label}
      </span>
    </div>
  );
}

export { VERDICT_COLORS };
