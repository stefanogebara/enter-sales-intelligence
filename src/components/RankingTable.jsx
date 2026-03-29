import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronRight } from 'lucide-react';
import { companies } from '../data/companies';

const VERDICT_BADGE = {
  QUALIFIED: 'bg-verdict-qualified-bg text-verdict-qualified',
  POTENTIAL: 'bg-verdict-potential-bg text-verdict-potential',
  NOT_QUALIFIED: 'bg-verdict-unqualified-bg text-verdict-unqualified',
};

const VERDICT_LABEL = {
  QUALIFIED: 'Qualificado',
  POTENTIAL: 'Potencial',
  NOT_QUALIFIED: 'Não Qual.',
};

const COLUMNS = [
  { key: 'rank', label: '#', sortable: false },
  { key: 'name', label: 'Empresa', sortable: true },
  { key: 'segment', label: 'Segmento', sortable: true },
  { key: 'employees', label: 'Funcionários', sortable: true },
  { key: 'estimatedCases', label: 'Casos/Ano', sortable: true },
  { key: 'volume', label: 'Vol.', sortable: true },
  { key: 'complexity', label: 'Compl.', sortable: true },
  { key: 'timing', label: 'Timing', sortable: true },
  { key: 'total', label: 'Score', sortable: true },
  { key: 'estimatedARR', label: 'ARR Est.', sortable: true },
  { key: 'verdict', label: 'Veredicto', sortable: true },
];

export default function RankingTable({ onSelectCompany }) {
  const [sortKey, setSortKey] = useState('total');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    const arr = [...companies];
    arr.sort((a, b) => {
      let va, vb;
      if (['volume', 'complexity', 'timing', 'total', 'estimatedARR', 'estimatedCases'].includes(sortKey)) {
        va = a.score[sortKey];
        vb = b.score[sortKey];
      } else if (sortKey === 'verdict') {
        const order = { QUALIFIED: 0, POTENTIAL: 1, NOT_QUALIFIED: 2 };
        va = order[a.score.verdict];
        vb = order[b.score.verdict];
      } else {
        va = a[sortKey];
        vb = b[sortKey];
      }
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
    return arr;
  }, [sortKey, sortAsc]);

  const handleSort = (key) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-enter-white mb-1">Ranking de Priorização</h1>
        <p className="text-enter-gray-500 text-sm">
          Todas as empresas da base Enter ordenadas por potencial trabalhista
        </p>
      </div>

      <div className="enter-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-enter-gray-800">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-3 text-left font-semibold text-enter-gray-500 text-xs uppercase tracking-wider whitespace-nowrap ${
                      col.sortable ? 'cursor-pointer hover:text-enter-gold select-none' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        <ArrowUpDown className={`w-3 h-3 ${sortKey === col.key ? 'text-enter-gold' : 'text-enter-gray-700'}`} />
                      )}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-enter-gray-800/50">
              {sorted.map((company, idx) => (
                <tr
                  key={company.id}
                  className="hover:bg-enter-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => onSelectCompany(company)}
                >
                  <td className="px-3 py-2.5 font-mono text-enter-gray-600 text-xs">{idx + 1}</td>
                  <td className="px-3 py-2.5 font-semibold text-enter-white">{company.name}</td>
                  <td className="px-3 py-2.5 text-enter-gray-400">{company.segment}</td>
                  <td className="px-3 py-2.5 font-mono text-enter-gray-300">{company.employees.toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2.5 font-mono text-enter-gray-300">{company.score.estimatedCases.toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2.5 font-mono text-enter-gray-400">{company.score.volume}</td>
                  <td className="px-3 py-2.5 font-mono text-enter-gray-400">{company.score.complexity}</td>
                  <td className="px-3 py-2.5 font-mono text-enter-gray-400">{company.score.timing}</td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono font-bold text-lg text-enter-white">{company.score.total}</span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-enter-gold">
                    US${(company.score.estimatedARR / 1000).toFixed(0)}k
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`enter-badge ${VERDICT_BADGE[company.score.verdict]}`}>
                      {VERDICT_LABEL[company.score.verdict]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <ChevronRight className="w-4 h-4 text-enter-gray-700" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
