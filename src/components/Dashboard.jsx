import { useState, useMemo } from 'react';
import { Search, Filter, TrendingUp, Building2, Users, AlertTriangle } from 'lucide-react';
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

  // Stats
  const qualified = companies.filter((c) => c.score.verdict === 'QUALIFIED').length;
  const potential = companies.filter((c) => c.score.verdict === 'POTENTIAL').length;
  const totalEmployees = companies.reduce((sum, c) => sum + c.employees, 0);
  const totalEstCases = companies.reduce((sum, c) => sum + c.score.estimatedCases, 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Qualificação Trabalhista
        </h1>
        <p className="text-slate-500">
          Base de clientes Enter — análise de potencial para contencioso trabalhista
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <SummaryCard
          icon={Building2}
          label="Empresas"
          value={companies.length}
          color="text-blue-600 bg-blue-50"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Qualificadas"
          value={qualified}
          sub={`${potential} potenciais`}
          color="text-emerald-600 bg-emerald-50"
        />
        <SummaryCard
          icon={Users}
          label="Total Funcionários"
          value={totalEmployees.toLocaleString('pt-BR')}
          color="text-purple-600 bg-purple-50"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Casos Est./Ano"
          value={totalEstCases.toLocaleString('pt-BR')}
          color="text-orange-600 bg-orange-50"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-enter-blue/30 focus:border-enter-blue bg-white"
          />
        </div>

        {/* Segment tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onClick={onSelectCompany}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          Nenhuma empresa encontrada
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">
            {label}
            {sub && <span className="text-slate-400"> · {sub}</span>}
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
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
        active
          ? 'bg-navy-800 text-white'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      {label}
      <span className={`ml-1 ${active ? 'text-white/60' : 'text-slate-300'}`}>
        {count}
      </span>
    </button>
  );
}
