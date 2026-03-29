import { useEffect, useState } from 'react';

const VERDICT_COLORS = {
  QUALIFIED: { stroke: '#22C55E', bg: 'bg-verdict-qualified-bg', text: 'text-verdict-qualified', label: 'Qualificado' },
  POTENTIAL: { stroke: '#FFAE35', bg: 'bg-verdict-potential-bg', text: 'text-verdict-potential', label: 'Potencial' },
  NOT_QUALIFIED: { stroke: '#EF4444', bg: 'bg-verdict-unqualified-bg', text: 'text-verdict-unqualified', label: 'Não Qualificado' },
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
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#2A2A2A" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={colors.stroke} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="score-gauge-circle"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold font-mono" style={{ color: colors.stroke }}>
            {score.total}
          </span>
        </div>
      </div>
      <span className={`enter-badge ${colors.bg} ${colors.text}`}>
        {colors.label}
      </span>
    </div>
  );
}

export { VERDICT_COLORS };
