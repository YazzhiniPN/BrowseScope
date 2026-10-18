import { useEffect, useState } from 'react';
import { getVisits } from '../api.js';

const CATEGORIES = ['', 'productive', 'educational', 'news', 'shopping', 'social', 'entertainment', 'other'];

export default function HistoryTable() {
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      getVisits(search, category).then((data) => setVisits(data.slice(0, 200)));
    }, 250); // debounce so we don't hammer the API on every keystroke
    return () => clearTimeout(timeout);
  }, [search, category]);

  return (
    <div className="card enter">
      <h3>Search & Filter History</h3>
      <div className="toolbar">
        <input
          placeholder="Search title or URL…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === '' ? 'All categories' : c}</option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Domain</th>
              <th>Category</th>
              <th>Visited</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.visitId}>
                <td>
                  <a href={v.url} target="_blank" rel="noreferrer">
                    {v.title || v.url}
                  </a>
                </td>
                <td>{v.domain}</td>
                <td><span className={`badge badge-${v.category}`}>{v.category}</span></td>
                <td>{new Date(v.visitTimeEpochMillis).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visits.length === 0 && <p className="empty-state">No visits match your filters.</p>}
    </div>
  );
}
