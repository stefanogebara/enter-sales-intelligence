import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronRight } from 'lucide-react';
import { companies } from '../data/companies';

const VERDICT_BADGE = {
  QUALIFIED: 'bg-emerald-100 text-emerald-700',
  POTENTIAL: 'bg-amber-100 text-amber-700',
  NOT_QUALIFIED: 'bg-red-100 text-red-700',
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
  { key: 'volume', label: 'Volume', sortable: true },
  { key: 'complexity', label: 'Complexidade', sortable: true },
  { key: 'timing', label: 'Timing', sortable: true },
  { key: 'total', label: 'Score Total', sortable: true },
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
      if (['volume', 'complexity', 'timing', 'total', 'estimatedARR'].includes(sortKey)) {
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
      if (typeof va === 'string') {
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortAsc ? va - vb : vb - va;
    });
    return arr;
  }, [sortKey, sortAsc]);

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Ranking de Priorização</h1>
        <p className="text-slate-500">
          Todas as empresas da base Enter ordenadas por potencial trabalhista
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap ${
                      col.sortable ? 'cursor-pointer hover:text-slate-900 select-none' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        <ArrowUpDown className={`w-3 h-3 ${sortKey === col.key ? 'text-enter-blue' : 'text-slate-300'}`} />
                      )}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((company, idx) => (
                <tr
                  key={company.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onSelectCompany(company)}
                >
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{company.name}</td>
                  <td className="px-4 py-3 text-slate-500">{company.segment}</td>
                  <td className="px-4 py-3 font-mono">{company.employees.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 font-mono">{company.score.volume}</td>
                  <td className="px-4 py-3 font-mono">{company.score.complexity}</td>
                  <td className="px-4 py-3 font-mono">{company.score.timing}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-lg">{company.score.total}</span>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    US${(company.score.estimatedARR / 1000).toFixed(0)}k
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${VERDICT_BADGE[company.score.verdict]}`}>
                      {VERDICT_LABEL[company.score.verdict]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-slate-300" />
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
