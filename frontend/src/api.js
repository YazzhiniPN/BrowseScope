const BASE_URL = 'http://localhost:8081/api/history';

export async function uploadHistoryFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function getStatus() {
  const res = await fetch(`${BASE_URL}/status`);
  return res.json();
}

export async function getVisits(search = '', category = '') {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  const res = await fetch(`${BASE_URL}/visits?${params.toString()}`);
  return res.json();
}

export async function getDomainStats() {
  const res = await fetch(`${BASE_URL}/stats/domains`);
  return res.json();
}

export async function getDailyActivity() {
  const res = await fetch(`${BASE_URL}/stats/daily`);
  return res.json();
}

export async function getHourlyActivity() {
  const res = await fetch(`${BASE_URL}/stats/hourly`);
  return res.json();
}

export async function getProductivity() {
  const res = await fetch(`${BASE_URL}/productivity`);
  return res.json();
}

export async function getGraph() {
  const res = await fetch(`${BASE_URL}/graph`);
  return res.json();
}
