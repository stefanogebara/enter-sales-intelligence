const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchCompanies() {
  return request('/companies');
}

export async function qualifyCompany(companyId) {
  return request('/qualify', {
    method: 'POST',
    body: JSON.stringify({ companyId }),
  });
}

export async function generateDiscovery(companyId) {
  return request('/discovery', {
    method: 'POST',
    body: JSON.stringify({ companyId }),
  });
}

export async function generatePitch(companyId) {
  return request('/pitch', {
    method: 'POST',
    body: JSON.stringify({ companyId }),
  });
}

export async function runSimulation(companyId) {
  return request('/simulate', {
    method: 'POST',
    body: JSON.stringify({ companyId }),
  });
}
