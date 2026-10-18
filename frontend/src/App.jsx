import { useEffect, useState } from 'react';
import UploadHistory from './components/UploadHistory.jsx';
import Dashboard from './components/Dashboard.jsx';
import NavigationGraph from './components/NavigationGraph.jsx';
import HistoryTable from './components/HistoryTable.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
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
        <div className="header-brand">
          <h1>🔍 BrowseScope</h1>
          <span className="tagline">Local-first browsing analytics</span>
        </div>
        <div className="header-actions">
          <ThemeToggle />
        </div>
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
