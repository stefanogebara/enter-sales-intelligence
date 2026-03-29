import { useState, useMemo } from 'react';
import { Search, Building2, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { companies, segments } from '../data/companies';
import CompanyCard from './CompanyCard';

export default function Dashboard({ onSelectCompany }) {
  const [search, setSearch] = useState('');
  const [activeSegment, setActiveSegment] = useState('All');

  const filtered = useMemo(() => {
    let result = companies;
    if (activeSegment !== 'All') {
      result = result.filter((c) => c.segment === activeSegment);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.segment.toLowerCase().includes(q) ||
        c.headquarters.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeSegment]);

  const qualified = companies.filter((c) => c.score.verdict === 'QUALIFIED').length;
  const potential = companies.filter((c) => c.score.verdict === 'POTENTIAL').length;
  const totalEmployees = companies.reduce((sum, c) => sum + c.employees, 0);
  const totalEstCases = companies.reduce((sum, c) => sum + c.score.estimatedCases, 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-enter-white mb-1">
          Qualificação Trabalhista
        </h1>
        <p className="text-enter-gray-500 text-sm">
          Base de clientes Enter — análise de potencial para contencioso trabalhista
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <SummaryCard
          icon={Building2}
          label="Empresas"
          value={companies.length}
          color="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Qualificadas"
          value={qualified}
          sub={`${potential} potenciais`}
          color="text-verdict-qualified"
          iconBg="bg-verdict-qualified/10"
        />
        <SummaryCard
          icon={Users}
          label="Total Funcionários"
          value={totalEmployees.toLocaleString('pt-BR')}
          color="text-enter-gold"
          iconBg="bg-enter-gold/10"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Casos Est./Ano"
          value={totalEstCases.toLocaleString('pt-BR')}
          color="text-orange-400"
          iconBg="bg-orange-500/10"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-enter-gray-500" />
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-enter-gray-900 border border-enter-gray-800 rounded-enter text-enter-white placeholder:text-enter-gray-600 focus:outline-none focus:border-enter-gold/50 focus:ring-1 focus:ring-enter-gold/20 transition-colors"
          />
        </div>

        <div className="flex items-center gap-0.5 bg-enter-gray-900 border border-enter-gray-800 rounded-enter p-1">
          <SegmentTab
            label="Todos"
            active={activeSegment === 'All'}
            count={companies.length}
            onClick={() => setActiveSegment('All')}
          />
          {segments.map((seg) => (
            <SegmentTab
              key={seg}
              label={seg}
              active={activeSegment === seg}
              count={companies.filter((c) => c.segment === seg).length}
              onClick={() => setActiveSegment(seg)}
            />
          ))}
        </div>
      </div>

      {/* Company grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onClick={onSelectCompany}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-enter-gray-500">
          Nenhuma empresa encontrada
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color, iconBg }) {
  return (
    <div className="enter-card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-enter flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-xl font-bold text-enter-white">{value}</p>
          <p className="text-[11px] text-enter-gray-500 uppercase tracking-wide">
            {label}
            {sub && <span className="text-enter-gray-600"> · {sub}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

function SegmentTab({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 text-[11px] font-medium rounded-enter transition-colors whitespace-nowrap cursor-pointer ${
        active
          ? 'bg-enter-gold text-enter-black'
          : 'text-enter-gray-500 hover:text-enter-white hover:bg-enter-gray-800'
      }`}
    >
      {label}
      <span className={`ml-1 ${active ? 'text-enter-black/60' : 'text-enter-gray-600'}`}>
        {count}
      </span>
    </button>
  );
}
