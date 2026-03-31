import { useState, useCallback } from 'react';
import Presentation from './components/Presentation';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RankingTable from './components/RankingTable';
import CompanyDetail from './components/CompanyDetail';
import { qualifyCompany, generateDiscovery, generatePitch, runSimulation } from './lib/api';

export default function App() {
  const [view, setView] = useState('presentation');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [analyses, setAnalyses] = useState({});

  const handleEnterPlatform = useCallback(() => setView('dashboard'), []);

  const handleSelectCompany = useCallback((company) => {
    setSelectedCompany(company);
    setView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setView('dashboard');
    setSelectedCompany(null);
  }, []);

  const handleNavigate = useCallback((target) => {
    if (target === 'dashboard' || target === 'ranking') {
      setView(target);
      setSelectedCompany(null);
    }
  }, []);

  const updateAnalysis = useCallback((companyId, type, update) => {
    setAnalyses((prev) => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        [type]: { ...(prev[companyId]?.[type] || {}), ...update },
      },
    }));
  }, []);

  const handleRunAnalysis = useCallback(
    async (type) => {
      if (!selectedCompany) return;
      const id = selectedCompany.id;
      updateAnalysis(id, type, { loading: true, error: null });
      try {
        const apiCall = { qualify: qualifyCompany, discovery: generateDiscovery, pitch: generatePitch, simulate: runSimulation }[type];
        const result = await apiCall(id);
        if (type === 'simulate') {
          updateAnalysis(id, type, { loading: false, data: result });
        } else if (type === 'qualify') {
          updateAnalysis(id, type, { loading: false, data: result.text || '', enrichedScore: result.enrichedScore || null });
        } else {
          updateAnalysis(id, type, { loading: false, data: result.text || result.content || JSON.stringify(result, null, 2) });
        }
      } catch (err) {
        updateAnalysis(id, type, { loading: false, error: err.message });
      }
    },
    [selectedCompany, updateAnalysis]
  );

  const currentAnalysis = selectedCompany ? (analyses[selectedCompany.id] || {}) : {};

  if (view === 'presentation') {
    return <Presentation onEnterPlatform={handleEnterPlatform} />;
  }

  return (
    <Layout activeView={view === 'detail' ? 'dashboard' : view} onNavigate={handleNavigate}>
      {view === 'dashboard' && <Dashboard onSelectCompany={handleSelectCompany} />}
      {view === 'ranking' && <RankingTable onSelectCompany={handleSelectCompany} />}
      {view === 'detail' && selectedCompany && (
        <CompanyDetail
          company={selectedCompany}
          onBack={handleBack}
          analysisState={currentAnalysis}
          onRunAnalysis={handleRunAnalysis}
        />
      )}
    </Layout>
  );
}
