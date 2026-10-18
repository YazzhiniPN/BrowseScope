import { useEffect, useState } from 'react';
import UploadHistory from './components/UploadHistory.jsx';
import Dashboard from './components/Dashboard.jsx';
import NavigationGraph from './components/NavigationGraph.jsx';
import HistoryTable from './components/HistoryTable.jsx';
import { getStatus } from './api.js';

const TABS = ['Dashboard', 'Navigation Graph', 'History'];

export default function App() {
  const [hasData, setHasData] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    getStatus().then((s) => setHasData(s.hasData)).catch(() => {});
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1>🔍 BrowseScope</h1>
        <span style={{ color: '#999', fontSize: '0.85rem' }}>Local-first browsing analytics</span>
      </div>

      {!hasData ? (
        <UploadHistory onLoaded={() => setHasData(true)} />
      ) : (
        <>
          <div className="tabs">
            {TABS.map((tab) => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>

          {activeTab === 'Dashboard' && <Dashboard />}
          {activeTab === 'Navigation Graph' && <NavigationGraph />}
          {activeTab === 'History' && <HistoryTable />}
        </>
      )}
    </div>
  );
}
